const mediaTypes = {
    audio: [
      {
        extension: ".aac",
        mimeType: "audio/aac",
        maxSize: "16 MB"
      },
      {
        extension: ".amr",
        mimeType: "audio/amr",
        maxSize: "16 MB"
      },
      {
        extension: ".mp3",
        mimeType: "audio/mpeg",
        maxSize: "16 MB"
      },
      {
        extension: ".m4a",
        mimeType: "audio/mp4",
        maxSize: "16 MB"
      },
      {
        extension: ".ogg",
        mimeType: "audio/ogg (OPUS codecs only; base audio/ogg not supported.)",
        maxSize: "16 MB"
      }
    ],
    document: [
      {
        extension: ".txt",
        mimeType: "text/plain",
        maxSize: "100 MB"
      },
      {
        extension: ".xls",
        mimeType: "application/vnd.ms-excel",
        maxSize: "100 MB"
      },
      {
        extension: ".xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        maxSize: "100 MB"
      },
      {
        extension: ".doc",
        mimeType: "application/msword",
        maxSize: "100 MB"
      },
      {
        extension: ".docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        maxSize: "100 MB"
      },
      {
        extension: ".ppt",
        mimeType: "application/vnd.ms-powerpoint",
        maxSize: "100 MB"
      },
      {
        extension: ".pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        maxSize: "100 MB"
      },
      {
        extension: ".pdf",
        mimeType: "application/pdf",
        maxSize: "100 MB"
      }
    ],
    image: [
      {
        extension: ".jpeg",
        mimeType: "image/jpeg",
        maxSize: "5 MB"
      },
      {
        extension: ".png",
        mimeType: "image/png",
        maxSize: "5 MB"
      }
    ],
    sticker: [
      {
        type: "Animated sticker",
        extension: ".webp",
        mimeType: "image/webp",
        maxSize: "500 KB"
      },
      {
        type: "Static sticker",
        extension: ".webp",
        mimeType: "image/webp",
        maxSize: "100 KB"
      }
    ],
    video: [
      {
        extension: ".3gp",
        mimeType: "video/3gpp",
        maxSize: "16 MB"
      },
      {
        extension: ".mp4",
        mimeType: "video/mp4",
        maxSize: "16 MB"
      }
    ]
  };
  
 export default mediaTypes
  