import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder = "Enter content..." }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: '#1f2937',
          color: 'white',
          borderRadius: '0.5rem',
        }}
      />
      <style jsx global>{`
        .ql-toolbar {
          background: #374151 !important;
          border: 1px solid #4b5563 !important;
          border-bottom: none !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
        }
        .ql-container {
          background: #1f2937 !important;
          border: 1px solid #4b5563 !important;
          border-radius: 0 0 0.5rem 0.5rem !important;
          color: white !important;
        }
        .ql-editor {
          color: white !important;
          min-height: 120px;
        }
        .ql-toolbar .ql-stroke {
          fill: none;
          stroke: #d1d5db !important;
        }
        .ql-toolbar .ql-fill {
          fill: #d1d5db !important;
          stroke: none;
        }
        .ql-toolbar .ql-picker-label {
          color: #d1d5db !important;
        }
        .ql-toolbar button:hover {
          background: #4b5563 !important;
        }
        .ql-toolbar button.ql-active {
          background: #cd7f32 !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;