import React from "react";
import { Star, StarHalf, Star as StarOutline } from "lucide-react"; // Import icons
import { FaStar } from "react-icons/fa";
const RatingStars = ({ rating }) => {
  const MAX_STARS = 5;
  const fullStars = Math.floor(rating); // Number of full stars
  const halfStar = rating % 1 >= 0.5; // Check if there's a half star
  const emptyStars = MAX_STARS - fullStars - (halfStar ? 1 : 0); // Remaining empty stars

  return (
    <div className="flex items-center  space-x-1">
      {/* Render full stars */}
      {Array(fullStars)
        .fill()
        .map((_, i) => (
          <FaStar key={`full-${i}`} size={12}  className="text-yellow-500" />
        ))}

      {/* Render half star if applicable */}
      {halfStar && <StarHalf size={12}  className="text-yellow-500" />}

      {/* Render empty stars */}
      {Array(emptyStars)
        .fill()
        .map((_, i) => (
          <StarOutline size={12}  key={`empty-${i}`} className="text-gray-300" />
        ))}
    </div>
  );
};

export default RatingStars;
