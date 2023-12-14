import { useEffect, useMemo, useRef, useState } from "react";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useForm, SubmitHandler } from "react-hook-form";
import { firestore } from "./utils/firebase";
import classNames from "classnames";

import styles from "./App.module.scss";
import NumberInputComponent from "./components/NumberInputComponent/NumberInputComponent";
import TextInputComponent from "./components/TextInputComponent/TextInputComponent";
import CodeSnippet from "./components/CodeSnippet/CodeSnippet";

interface IPopupConfigurationAPI {
  comment_title: string;
  rating_title: string;
  placeholder: string;
  wait_time: number;
  max_display: number;
  display_frequency: number;
}

interface IFormInput {
  ratingTitle: string;
  commentTitle: string;
  placeholder: string;
  waitTime: string;
  maxDisplay: string;
  displayFrequency: string;
}

export default function App() {
  const [dataInDb, setDataInDb] = useState<boolean>(false);
  const [showCodeSnippet, setShowCodeSnippet] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<IFormInput>();

  // Set the value of the ref
  const dataInDbRef = useRef(dataInDb);
  useEffect(() => {
    dataInDbRef.current = dataInDb;
  }, [dataInDb]);

  const codeSnippet: string[] = useMemo(() => {
    /**
     * This function is used to generate the code snippet that the user
     * can copy and paste into their website.
     */

    const userId: string = localStorage.getItem("userId") || "";
    if (!userId) {
      setError("root", {
        type: "manual",
        message:
          "Failed to setup configuration. Please refresh the page and try again.",
      });
    }

    // TODO: Get a better minifier
    const minify = (code: string) => {
      return code.replace(/\n[ ]*/g, "");
    };

    return [
      minify(`
        <!-- Copy and paste this code snippet in your website's <head> tag -->
        <link 
          rel="stylesheet" 
          crossorigin="anonymous" 
          referrerpolicy="no-referrer" 
          href="https://firebasestorage.googleapis.com/v0/b/pivony-case-study.appspot.com/o/index-1h9jF6HC.css?alt=media&token=0d15530d-a9b0-4ff2-a257-973ea0b367fe"
        >
      `),
      minify(`
        <!-- Copy and paste this code snippet just before website's </body> tag -->
        <script>
          localStorage.removeItem("pivonyDocumentId");
          localStorage.setItem("pivonyDocumentId", "${userId}");
        </script>
        <script 
          type="module" 
          crossorigin="anonymous" 
          referrerpolicy="no-referrer" 
          src="https://firebasestorage.googleapis.com/v0/b/pivony-case-study.appspot.com/o/index-EyoEURki.js?alt=media&token=a526f290-2c26-45e3-80b3-d5ab60880500"
        ></script>
      `),
    ];
  }, [localStorage.getItem("userId")]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    /**
     * This function is called when the user submits the form.
     * It is responsible for updating the configuration in the database.
     */

    clearErrors();
    console.debug("Form Data: ", data);
    const body: IPopupConfigurationAPI = {
      rating_title: data.ratingTitle,
      comment_title: data.commentTitle,
      placeholder: data.placeholder,
      wait_time: parseInt(data?.waitTime ?? 0),
      display_frequency: parseInt(data?.displayFrequency ?? 0),
      max_display: parseInt(data?.maxDisplay ?? 0),
    };
    const userId: string = localStorage.getItem("userId") || "";
    const documentRef = doc(firestore, "popup_configuration", userId);

    try {
      await setDoc(documentRef, body);
      setDataInDb(true);
      setShowCodeSnippet(true);
      console.debug("Document successfully written!");
    } catch (error) {
      console.error("Failed to write document: ", error);
      setError("root", {
        type: "manual",
        message: "Failed to setup configuration. Please try again.",
      });
    }
  };

  useEffect(() => {
    /**
     * This acts as a unique identifier for the document. This is used to
     * identify the document in the database.
     *
     * This is a simple implementation of a unique identifier for the users.
     * We use this identifier to generate code and distinguish between popups.
     */

    let userId: string = localStorage.getItem("userId") || "";
    if (!userId) {
      // generate random document id
      userId = Date.now().toString(36);
      localStorage.setItem("userId", userId);
    }

    // This is done to prevent the document from being fetched multiple times
    if (dataInDbRef.current) return;

    // Get the document if it exists
    const documentRef = doc(firestore, "popup_configuration", userId);
    getDoc(documentRef)
      .then((doc) => {
        console.debug("Document data:", doc.data());
        const data = doc.data() as IPopupConfigurationAPI;

        // Set the values of the form
        if (data) {
          setValue("ratingTitle", data?.rating_title ?? "");
          setValue("commentTitle", data?.comment_title ?? "");
          setValue("placeholder", data?.placeholder ?? "");
          setValue("waitTime", data?.wait_time?.toString() ?? "0");
          setValue("maxDisplay", data?.max_display?.toString() ?? "0");
          setValue(
            "displayFrequency",
            data?.display_frequency?.toString() ?? "0",
          );
          setShowCodeSnippet(true);
          setDataInDb(true);
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  }, []);

  return (
    <div className={styles.appRoot}>
      <div className={styles.contentContainer}>
        <form
          className={styles.formContainer}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.formHeader}>Setup Configuration</div>
          <div className={styles.formBody}>
            {/* Title for Rating Section */}
            <TextInputComponent
              label="Rating Section Title"
              name="ratingTitle"
              control={control}
              disabled={dataInDb}
              placeholder="Enter the title for rating"
              rules={{
                required: "Title for Rating Section is Required",
                type: "string",
                minLength: {
                  value: 3,
                  message: "Name should be at least 3 characters long",
                },
              }}
            />

            {/* Title for Comments Section */}
            <TextInputComponent
              label="Comment Section Title"
              name="commentTitle"
              control={control}
              disabled={dataInDb}
              placeholder="Enter the title for comment section"
              rules={{
                required: "Title for Comment Section is Required",
                type: "string",
                minLength: {
                  value: 3,
                  message: "Name should be at least 3 characters long",
                },
              }}
            />

            {/* Placeholder */}
            <TextInputComponent
              label="Comment Section Placeholder"
              name="placeholder"
              placeholder="Enter the placeholder for comment section"
              control={control}
              disabled={dataInDb && Boolean(getValues("placeholder"))}
              rules={{
                type: "string",
                minLength: {
                  value: 7,
                  message: "Placeholder should be at least 7 characters long",
                },
              }}
            />

            {/* Wait Time */}
            <NumberInputComponent
              label="Choose how much time to wait before showing the survey"
              name="waitTime"
              control={control}
              rules={{
                min: {
                  value: 0,
                  message: "Wait time cannot be lower than zero",
                },
                required: "Wait time is Required",
              }}
              adoronments="seconds"
            />

            {/* Max Display */}
            <NumberInputComponent
              label="Choose how many time to show the survey"
              name="maxDisplay"
              control={control}
              rules={{
                required: "Max Display is Required",
                min: {
                  value: 1,
                  message: "Max Display should be at least 1",
                },
              }}
              adoronments="times"
            />

            {/* Display Frequency */}
            <NumberInputComponent
              label="Display Frequency - every"
              name="displayFrequency"
              control={control}
              rules={{
                required: "Display Frequency is Required",
                min: {
                  value: 1,
                  message: "Display Frequency should be at least 1",
                },
              }}
              adoronments="minutes"
            />
          </div>

          {/* Error */}
          {errors.root && (
            <div className={styles.formError}>
              <p>{errors.root.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className={styles.formFooter}>
            {isSubmitting ? (
              <div className={styles.formLoading}>
                <AiOutlineLoading3Quarters />
              </div>
            ) : null}
            <input
              className={classNames(
                styles.submitButton,
                isSubmitting ? styles.disabled : null,
              )}
              type="submit"
              value="Save"
              disabled={isSubmitting}
            />
          </div>
        </form>

        {/* Animation */}
        {/* {localStorage.getItem("userId") && dataInDb && ( */}
        <div
          className={classNames(
            styles.animationContainer,
            localStorage.getItem("userId") && dataInDb && showCodeSnippet
              ? styles.animate
              : styles.hide,
          )}
        >
          {codeSnippet.map((code, index) => (
            <CodeSnippet key={index} codeSnippet={code} />
          ))}
        </div>
        {/* )} */}
      </div>
    </div>
  );
}
