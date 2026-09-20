import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageCard=({imageUrl})=> {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//   const imageUrl = "YOUR_IMAGE_URL"; // The image URL you want to fetch

  useEffect(() => {
    const fetchImage = async () => {
      try {
        let url = encodeURIComponent(imageUrl)
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/fetch-image?imageUrl=${url}`, {
          responseType: 'blob', // Ensures the response is treated as binary data
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
        },
        });

        // Convert the Blob to an Object URL
        const imageObjectUrl = URL.createObjectURL(response.data);
        console.log({imageObjectUrl})
        // Set the image URL in state to render it
        setImageSrc(imageObjectUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching image:', error);
        setError('Failed to load image');
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageUrl]); // Trigger fetch when imageUrl changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <img src={imageSrc} alt="Fetched from Meta API" />
    </div>
  );
}

export default ImageCard;
