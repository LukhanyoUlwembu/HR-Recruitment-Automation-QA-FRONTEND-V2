    // SkillSelector.jsx
    import React from "react";
    import Select from "react-select";

    const SkillSelector = ({ skills, setSelectedSkills, selectedSkill, setSelectedSkill, error }) => {
    const handleAddSkill = () => {
        if (selectedSkill && !skills.includes(selectedSkill)) {
        setSelectedSkills([...skills, selectedSkill]);
        setSelectedSkill("");
        }
    };

    const handleRemoveSkill = (tag) => {
        setSelectedSkills(skills.filter((t) => t !== tag));
    };

    return (
        <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <div className="flex gap-2 items-center">
            <div className="w-full">
            <Select
                options={skills.map((skill) => ({ label: skill, value: skill }))}
                value={selectedSkill ? { label: selectedSkill, value: selectedSkill } : null}
                onChange={(selectedOption) => setSelectedSkill(selectedOption?.value || "")}
                placeholder="Select or search for a skill..."
                className="w-full"
            />
            </div>
        
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-wrap gap-2">
            {skills.map((tag) => (
            <span key={tag} className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center">
                {tag}
                <button
                onClick={() => handleRemoveSkill(tag)}
                className="ml-2 text-red-500 hover:text-red-700"
                >
                ×
                </button>
            </span>
            ))}
        </div>
        </div>
    );
    };

    export default SkillSelector;
