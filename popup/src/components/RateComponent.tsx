import classNames from "classnames";

interface RateComponentProps {
  rating: number;
  setRating: (rating: number) => void;
}

function RateComponent({ rating, setRating }: RateComponentProps) {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
    <div
      key={i}
      onClick={() => setRating(i)}
      className={classNames(
        "pivony-popup-flex pivony-popup-flex-col pivony-popup-items-center pivony-popup-w-8 pivony-popup-cursor-pointer pivony-popup-border-gray-400 pivony-popup-border-2 pivony-popup-select-none hover:pivony-popup-bg-blue-400 hover:pivony-popup-text-white",
        rating === i
          ? "pivony-popup-bg-blue-400 pivony-popup-text-white"
          : "pivony-popup-text-gray-800",
      )}
    >
      {i}
    </div>
  ));

  return (
    <div>
      <div className="pivony-popup-flex pivony-popup-justify-between pivony-popup-gap-2 pivony-popup-pt-6">
        {items}
      </div>
      <div className="pivony-popup-flex pivony-popup-justify-between pivony-popup-gap-2 pivony-popup-pt-3">
        <p className="pivony-popup-select-none pivony-popup-text-gray-800">
          Not likely
        </p>
        <p className="pivony-popup-select-none pivony-popup-text-gray-800">
          Very likely
        </p>
      </div>
    </div>
  );
}

export default RateComponent;
