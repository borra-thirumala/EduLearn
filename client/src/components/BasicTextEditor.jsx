import React from "react";
import ReactQuill from "react-quill"; // Import ReactQuill
import "react-quill/dist/quill.snow.css"; // Import Quill's CSS (snow theme is common)
// import './BasicTextEditor.css'; // You might still have custom CSS for wrapper

const BasicTextEditor = ({ input, setInput }) => {
  // Quill modules run: defines the toolbar options
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // Heading options
      ["bold", "italic", "underline", "strike"], // Inline formatting
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ align: [] }], // Text alignment
      ["link", "image"], // Links and images (optional)
      ["clean"], // Remove formatting button
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  const handleChange = (content) => {
    // 'content' will be the HTML string from Quill
    setInput({ ...input, description: content });
  };

  return (
    <div className="basic-text-editor">
      <ReactQuill
        theme="snow" // Use the 'snow' theme for a clean look with a toolbar
        value={input.description || ""} // Ensure value is a string, even if description is undefined
        onChange={handleChange}
        modules={modules} // Apply the defined toolbar modules
        formats={formats} // Apply the defined formats
      />
    </div>
  );
};

export default BasicTextEditor;

// import React from 'react';
// // import './BasicTextEditor.css';

// const BasicTextEditor = ({ input, setInput }) => {
//   const handleChange = (content) => {
//     setInput({ ...input, description: content });
//   };

//   return (
//     <div className="basic-text-editor">
//       <textarea
//         className="editor-textarea"
//         value={input.description}
//         onChange={(e) => handleChange(e.target.value)} // ✅ Correct way
//       />
//     </div>
//   );
// };

// export default BasicTextEditor;
