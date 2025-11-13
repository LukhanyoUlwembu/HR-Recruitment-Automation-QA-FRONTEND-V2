    import React, { useRef, useState } from "react";

    // The actual file uploader UI
    const FileUploader = ({
    fileTypes = [],
    selectedFileType,
    setSelectedFileType,
    fileInputRef,
    handleFileChange,
    handleFileDrop,
    }) => (
    <>
        {/* Step 1: Choose document type */}
        <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
        </label>
        <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
        >
            <option value="">Select Document Type</option>
            {fileTypes.map((type) => (
            <option key={type} value={type}>
                {type}
            </option>
            ))}
        </select>
        </div>
        {/* Step 2: Upload area */}
        <div
        onClick={() => {
            if (!selectedFileType) {
            alert("Please select a document type first.");
            } else {
            fileInputRef.current?.click();
            }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-400 transition"
        >
        <div className="text-6xl mb-4">📄</div>
        <p className="text-sm text-gray-600">Click to upload file</p>
        <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, DOC, DOCX
        </p>
        <input
            type="file"
            accept=".pdf,.doc,.docx"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
        />
        </div>
    </>
    );

    const UploadedFileItem = ({
    file,
    type,
    index,
    activeFileIndex,
    setActiveFileIndex,
    selectedFiles,
    setSelectedFiles,
    }) => (
    <div className="flex items-center justify-between border p-2 rounded">
        <div>
        <p className="text-sm font-semibold">{type}</p>
        <p className="text-sm text-gray-600">{file.name}</p>
        </div>
        <div className="flex gap-2">
        <button
            onClick={() => setActiveFileIndex(index)}
            className={`px-3 py-1 rounded text-sm ${
            activeFileIndex === index
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
        >
            {activeFileIndex === index ? "Selected" : "Select"}
        </button>
        <button
            onClick={() => {
            const updated = selectedFiles.filter((_, i) => i !== index);
            setSelectedFiles(updated);
            if (activeFileIndex === index) {
                setActiveFileIndex(updated.length ? 0 : null);
            } else if (activeFileIndex > index) {
                setActiveFileIndex((prev) => prev - 1);
            }
            }}
            className="px-3 py-1 rounded text-sm bg-red-500 text-white hover:bg-red-600"
        >
            Delete
        </button>
        </div>
    </div>
    );

    const FileUploadSection = ({
    fileTypes = [],
    selectedFiles = [],
    setSelectedFiles,
    activeFileIndex,
    setActiveFileIndex,
    }) => {
    const fileInputRef = useRef(null);
    const [selectedFileType, setSelectedFileType] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && selectedFileType) {
        setSelectedFiles((prev) => [...prev, { file, type: selectedFileType }]);
        setActiveFileIndex(selectedFiles.length);
        setSelectedFileType("");
        } else {
        alert("Please select a document type before uploading a file.");
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && selectedFileType) {
        setSelectedFiles((prev) => [...prev, { file, type: selectedFileType }]);
        setActiveFileIndex(selectedFiles.length);
        setSelectedFileType("");
        } else {
        alert("Please select a document type before dropping a file.");
        }
    };

    return (
        <div>
        <FileUploader
            fileTypes={fileTypes}
            selectedFileType={selectedFileType}
            setSelectedFileType={setSelectedFileType}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleFileDrop={handleFileDrop}
        />

        {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
            {selectedFiles.map(({ file, type }, index) => (
                <UploadedFileItem
                key={index}
                file={file}
                type={type}
                index={index}
                activeFileIndex={activeFileIndex}
                setActiveFileIndex={setActiveFileIndex}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                />
            ))}
            </div>
        )}

        {selectedFiles[activeFileIndex]?.file?.type === "application/pdf" && (
            <div className="mt-4">
            <embed
                src={URL.createObjectURL(selectedFiles[activeFileIndex].file)}
                type="application/pdf"
                width="100%"
                height="400px"
                className="rounded border"
            />
            </div>
        )}
        </div>
    );
    };

    export default FileUploadSection;
