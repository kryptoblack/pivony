import { useEffect, useMemo, useRef, useState } from "react";
import { TbDiscountCheck } from "react-icons/tb";
import { RiArrowRightSLine } from "react-icons/ri";
import {
    collection,
    onSnapshot,
    where,
    documentId,
    query,
} from "firebase/firestore";
import { ref, push } from "firebase/database";
import classNames from "classnames";

import RateComponent from "./components/RateComponent";
import ReviewComponent from "./components/ReviewComponent";
import { firestore, db } from "./utils/firebase";

enum Step {
    rating = 0,
    review = 1,
}

interface IPopupConfigurationResponse {
    rating_title: string;
    comment_title: string;
    placeholder: string;
    wait_time: number;
    max_display: number;
    display_frequency: number;
}

interface IPopupConfiguration {
    ratingTitle: string;
    commentTitle: string;
    placeholder: string;
    waitTime: number;
    maxDisplay: number;
    displayFrequency: number;
}

interface IState {
    step: Step;
    rating: number;
    review: string;
    show: boolean;
    popupTimeout: null;
    popupInterval: null;
    firstLoad: boolean;
}

export default function App() {
    const defaultState: IState = {
        step: Step.rating,
        rating: 0,
        review: "",
        show: false,
        popupTimeout: null,
        popupInterval: null,
        firstLoad: true,
    };

    const [step, setStep] = useState<Step>(defaultState.step);
    const [rating, setRating] = useState<number>(defaultState.rating);
    const [review, setReview] = useState<string>(defaultState.review);
    const [show, setShow] = useState<boolean>(defaultState.show);
    const [firstLoad, setFirstLoad] = useState<boolean>(defaultState.firstLoad);
    const [popupTimeout, setPopupTimeout] = useState<number | null>(
        defaultState.popupTimeout,
    );
    // const [popupInterval, setPopupInterval] = useState<number>(
    // defaultState.popupInterval,
    // );
    const [popupConfiguration, setPopupConfiguration] =
        useState<IPopupConfiguration>();

    // Reference for show
    const showRef = useRef(show);
    const firstLoadRef = useRef(firstLoad);
    const popupTimeoutRef = useRef(popupTimeout);

    useEffect(() => {
        showRef.current = show;
        firstLoadRef.current = firstLoad;
        popupTimeoutRef.current = popupTimeout;
    }, [show, firstLoad, popupTimeout]);

    const showPopup = (popupConfiguration: IPopupConfiguration) => {
        /**
         * This function acts as a wrapper to
         *
         * 1. Check if the popup should be shown
         * 2. Reset the state
         * 3. Increment the display count
         * 4. Show the popup
         */

        const displayCount = Number(sessionStorage.getItem("displayCount"));
        console.debug(
            "showPopup",
            showRef.current,
            displayCount,
            popupConfiguration,
        );

        // If the popup is already shown, don't show it again or the display is
        // already maxed out, don't show it again
        if (
            showRef.current ||
            (popupConfiguration && displayCount >= popupConfiguration.maxDisplay)
        )
            return;

        // Reset state
        setStep(defaultState.step);
        setRating(defaultState.rating);
        setReview(defaultState.review);

        console.debug("showPopup later");

        // Increment the display count
        sessionStorage.setItem("displayCount", String(displayCount + 1));

        // Show the popup
        setShow(true);
    };

    useEffect(() => {
        const applyPopupConfiguration = (
            popupConfiguration: IPopupConfiguration,
        ) => {
            /**
             * This function will be called when the popup configuration is fetched
             * from the database.
             *
             * This function has the following applications:
             *
             * 1. Wait x seconds before showing the popup
             * 2. Update the display count, responsible for showing the popup only x
             * times
             */

            setPopupConfiguration(popupConfiguration);
            console.debug(
                "applyPopupConfiguration",
                popupConfiguration,
                firstLoadRef.current,
            );

            // initialize the display count
            const displayCount = Number(sessionStorage.getItem("displayCount"));
            if (!displayCount) sessionStorage.setItem("displayCount", "0");

            // If the popup was shown in the past use the display frequency as delay
            // else use the wait time as delay. This is to done to handle the case when
            // the popup configuration is updated.
            //
            // The firstLoad logic is used as it also handles the case when the page is
            // refreshed.
            const delay = firstLoadRef.current
                ? popupConfiguration.waitTime * 1000
                : popupConfiguration.displayFrequency * 60000;

            if (firstLoadRef.current) setFirstLoad(false);

            console.debug("popupTimeout", Boolean(popupTimeoutRef.current), delay);
            if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
            setPopupTimeout(
                setTimeout(() => {
                    /**
                     * This function is used to show the popup after x seconds.
                     */

                    showPopup(popupConfiguration);
                }, delay),
            );
        };

        console.debug("in init useEffect");
        function init() {
            console.debug("init 1");
            const pivonyDocumentId = localStorage.getItem("pivonyDocumentId");
            if (!pivonyDocumentId) return;

            console.debug("init 2");
            const collectionRef = collection(firestore, "popup_configuration");
            const queryRef = query(
                collectionRef,
                where(documentId(), "==", pivonyDocumentId),
            );

            // There will be only one document since we are querying by documentId
            return onSnapshot(queryRef, (snapshot) => {
                console.debug("update");
                snapshot.docChanges().forEach((change) => {
                    const data = change.doc.data() as IPopupConfigurationResponse;
                    const config: IPopupConfiguration = {
                        ratingTitle: data.rating_title,
                        commentTitle: data.comment_title,
                        placeholder: data.placeholder,
                        waitTime: data.wait_time,
                        maxDisplay: data.max_display,
                        displayFrequency: data.display_frequency,
                    };
                    console.debug("change", change, data, config);
                    if (change.type === "added") {
                        applyPopupConfiguration(config);
                    } else if (change.type === "modified") {
                        applyPopupConfiguration(config);
                    } else if (change.type === "removed") {
                        setShow(false);
                    }
                });
            });
        }

        // Initialize the popup
        const unsubscribe = init();

        // Cleanup
        return () => {
            unsubscribe && unsubscribe();
            popupTimeoutRef.current && clearTimeout(popupTimeoutRef.current);
            // clearInterval(popupInterval);
        };
    }, []);

    const sendData = () => {
        /**
         * This function is used to send the data to the backend.
         */

        const body = {
            rating: rating,
            review: review,
        };

        push(ref(db, "answers"), body);
    };

    // Disable the button if the rating is 0 or the review is empty
    const isButtonDisabled: boolean = useMemo(() => {
        if (step === Step.rating) return rating == 0;
        else if (step === Step.review) return false;

        return true;
    }, [step, rating]);

    const title = useMemo(() => {
        if (step === Step.rating)
            return popupConfiguration?.ratingTitle ?? "Rate Us";

        return popupConfiguration?.commentTitle ?? "Tell Us More";
    }, [step, popupConfiguration]);

    // If the form is submitted, hide the popup
    if (!show) return <></>;

    return (
        <div
            className="pivony-popup-relative pivony-popup-z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop  */}
            <div className="pivony-popup-fixed pivony-popup-inset-0 pivony-popup-bg-gray-500 pivony-popup-bg-opacity-75 pivony-popup-transition-opacity"></div>

            {/* Popup */}
            <div className="pivony-popup-fixed pivony-popup-inset-0 pivony-popup-z-10 pivony-popup-w-screen pivony-popup-overflow-y-auto">
                <div className="pivony-popup-flex pivony-popup-min-h-full pivony-popup-items-center pivony-popup-justify-center pivony-popup-p-4 pivony-popup-text-center sm:pivony-popup-items-center">
                    <div className="pivony-popup-relative pivony-popup-transform pivony-popup-overflow-hidden pivony-popup-bg-white pivony-popup-text-left pivony-popup-shadow-xl pivony-popup-transition-all pivony-popup-border-2 pivony-popup-border-gray-400 pivony-popup-w-full sm:pivony-popup-w-[500px]">
                        <div className="pivony-popup-bg-white pivony-popup-flex pivony-popup-justify-between pivony-popup-align-center pivony-popup-border-b-2 pivony-popup-border-gray-400">
                            <div
                                id="title"
                                className="pivony-popup-self-center pivony-popup-py-2 pivony-popup-px-4 pivony-popup-font-bold"
                            >
                                {title}
                            </div>
                            <div
                                id="checkIconContainer"
                                className="pivony-popup-bg-blue-400 pivony-popup-p-2 pivony-popup-flex pivony-popup-items-center"
                            >
                                <TbDiscountCheck size="50" />
                            </div>
                        </div>
                        <div
                            id="inputContainer"
                            className="pivony-popup-bg-white pivony-popup-px-4 pivony-popup-py-8 sm:pivony-popup-px-6"
                        >
                            {step === Step.rating ? (
                                <RateComponent rating={rating} setRating={setRating} />
                            ) : (
                                <ReviewComponent
                                    review={review}
                                    setReview={setReview}
                                    placeholder={popupConfiguration?.placeholder}
                                />
                            )}
                        </div>
                        <div className="pivony-popup-bg-white pivony-popup-px-4 pivony-popup-py-3 pivony-popup-border-t-2 pivony-popup-border-gray-400 sm:pivony-popup-flex sm:pivony-popup-flex-row-reverse sm:pivony-popup-px-6">
                            <button
                                type="button"
                                onClick={() => {
                                    const nextStep = step + 1;
                                    const totalSteps = Object.keys(Step).length / 2;
                                    if (nextStep === totalSteps && popupConfiguration) {
                                        setShow(false);
                                        sendData();

                                        // TODO: Shift this to close button
                                        if (popupTimeout) clearTimeout(popupTimeout);
                                        setPopupTimeout(
                                            setTimeout(() => {
                                                /**
                                                 * This function is used to show the popup after x minutes.
                                                 * This is used when the user submits the review.
                                                 */

                                                console.debug(
                                                    "inside setTimeout displayFrequency",
                                                    show,
                                                    popupConfiguration.maxDisplay,
                                                );

                                                showPopup(popupConfiguration);
                                            }, popupConfiguration.displayFrequency * 60000),
                                        );
                                    } else setStep(nextStep);
                                }}
                                className={classNames(
                                    "pivony-popup-inline-flex pivony-popup-w-full pivony-popup-justify-center pivony-popup-items-center pivony-popup-gap-2 pivony-popup-rounded-md pivony-popup-px-3 pivony-popup-py-2 pivony-popup-text-sm pivony-popup-font-semibold pivony-popup-shadow-sm sm:pivony-popup-mt-0 sm:pivony-popup-w-auto",
                                    isButtonDisabled
                                        ? "pivony-popup-bg-gray-400 pivony-popup-text-gray-200 pivony-popup-cursor-not-allowed"
                                        : "hover:pivony-popup-bg-gray-100 hover:pivony-popup-text-black pivony-popup-bg-white pivony-popup-ring-1 pivony-popup-ring-inset pivony-popup-ring-gray-400",
                                )}
                                disabled={isButtonDisabled}
                            >
                                <p className="pivony-popup-self-center pivony-popup-select-none pivony-popup-text-gray-800">
                                    {step === Step.rating ? "Next" : "Send"}
                                </p>
                                <RiArrowRightSLine className="pivony-popup-text-gray-800" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
