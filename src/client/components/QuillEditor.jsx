import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Import Quill styles

const QuillEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const quillInstance = useRef(null); // Keep a reference to the Quill instance

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      // Initialize Quill only once
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }], // Header sizes
            ["bold", "italic", "underline"], // Formatting
            [{ align: [] }], // Alignment
            [{ list: "ordered" }, { list: "bullet" }], // Lists
            [{ color: [] }, { background: [] }], // Text colors and background
            ["link", "image"], // Links and images
          ],
        },
      });

      // Update value when content changes
      quillInstance.current.on("text-change", () => {
        const html = quillInstance.current.root.innerHTML;
        onChange(html);
      });
    }
  }, [onChange]);

  useEffect(() => {
    // Update editor content if `value` changes externally
    if (
      quillInstance.current &&
      value !== quillInstance.current.root.innerHTML
    ) {
      quillInstance.current.root.innerHTML = value || "";
    }
  }, [value]);

  return <div ref={editorRef} className="w-full h-64 border rounded-lg"></div>;
};

export default QuillEditor;
