interface ReviewComponentProps {
  review: string;
  setReview: (review: string) => void;
  placeholder?: string;
}

function ReviewComponent({
  review,
  setReview,
  placeholder,
}: ReviewComponentProps) {
  return (
    <div>
      <textarea
        autoFocus
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="pivony-popup-w-full pivony-popup-h-32 pivony-popup-border-2 pivony-popup-border-gray-400 pivony-popup-rounded-md pivony-popup-p-3 pivony-popup-resize-none focus:pivony-popup-outline-none focus:pivony-popup-ring-2 focus:pivony-popup-ring-blue-400 pivony-popup-text-gray-800"
        placeholder={placeholder ? placeholder : "Tell us more"}
      />
    </div>
  );
}

export default ReviewComponent;
