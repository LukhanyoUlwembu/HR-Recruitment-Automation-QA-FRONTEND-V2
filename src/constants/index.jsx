import { Briefcase, UserCheck, CalendarCheck, ShieldCheck, Globe, Users } from "lucide-react";

import createjobpost from '../assets/create-job-post.svg'
import jobrequisition from '../assets/job-requisition.svg'
import trackapplicants from '../assets/track-applicants.svg'

export const navItems = [
  { label: "JOBS", href: "#Jobs" },
  { label: "FEATURES", href: "#Features" },
  { label: "HOW TO...", href: "#How to" },
  { label: "ABOUT", href: "#About" },
];

export const jobArray = [
  {
    id: 1,
    title: "Software Quality Analyst",
    location: "Durban - KZN",
    type: "Full-Time",
    postedTime: "2hrs ago",
  },
  {
    id: 2,
    title: "Network Security Engineer",
    location: "Durban - KZN",
    type: "Full-Time",
    postedTime: "2hrs ago",
  },
  {
    id: 3,
    title: "Technical Support Specialist",
    location: "Durban - KZN",
    type: "Full-Time",
    postedTime: "2hrs ago",
  },
  {
    id: 4,
    title: "Human Resources Assistant",
    location: "Durban - KZN",
    type: "Full-Time",
    postedTime: "2hrs ago",
  },
  {
    id: 5,
    title: "Digital Marketing Coordinator",
    location: "Durban - KZN",
    type: "Full-Time",
    postedTime: "2hrs ago",
  },
  {
    id: 6,
    title: "Data Entry Clerk",
    location: "Durban - KZN",
    type: "Full-Time",
    postedTime: "2hrs ago",
  },
];

export const features = [
  {
    icon: <Briefcase />,
    text: "Internal Job Management",
    description: "Create, publish, and manage job openings efficiently across departments.",
  },
  {
    icon: <UserCheck />,
    text: "Streamlined Applicant Tracking",
    description: "Track candidate progress from application to onboarding in a centralized system.",
  },
  {
    icon: <CalendarCheck />,
    text: "Interview Scheduling",
    description: "Coordinate interview slots with panels and candidates using integrated scheduling tools.",
  },
  {
    icon: <ShieldCheck />,
    text: "Secure Data Handling",
    description: "Ensure candidate and HR data stays protected with enterprise-grade security.",
  },
  {
    icon: <Globe />,
    text: "Applicant Portal",
    description: "Allow job seekers to browse openings, apply, and track their application status.",
  },
  {
    icon: <Users />,
    text: "Collaboration & Visibility",
    description: "Enable recruiters and panel members to collaborate and make informed hiring decisions.",
  },
];

export const checklistItems = [
  { title: "Create a Professional Profile", description: "Stand out with a detailed and engaging profile." },
  { title: "Upload Your Resume", description: "Easily apply to jobs with a single click." },
  { title: "Set Job Alerts", description: "Stay updated with job openings that match your skills." },
  { title: "Track Your Applications", description: "Monitor the status of your job applications in real-time." },
];

export const jobData = [
  {
    application: 'Software Developer',
    screening: 'IT Manager',
    interview: 'Graphic Designer',
    offer: 'HVAC Technician',
    onboarding: 'Web Developer',
  },
  {
    application: 'Marketing',
    screening: 'Data Scientist',
    interview: 'Electrical Engineer',
    offer: 'Maintenance Worker',
    onboarding: 'Mobile App Developer',
  },
  {
    application: 'Team Lead',
    screening: 'Cybersecurity Analyst',
    interview: 'Electrician',
    offer: 'Electrician',
    onboarding: 'Software Developer',
  },
  {
    application: 'Quality Assure',
    screening: 'Accountant',
    interview: 'Sales Representative',
    offer: 'Web Developer',
    onboarding: 'DevOps Engineer',
  },
];

export const jobs = [
  {
    title: "Software Developer",
    location: "Cape Town",
    closingDate: "2025-06-15",
    contractType: "Full-time",
    action: "Apply"
  },
  {
    title: "Marketing Specialist",
    location: "Johannesburg",
    closingDate: "2025-07-01",
    contractType: "Part-time",
    action: "Apply"
  },
  {
    title: "Data Scientist",
    location: "Durban",
    closingDate: "2025-06-30",
    contractType: "Contract",
    action: "Apply"
  },
  {
    title: "Web Developer",
    location: "Pretoria",
    closingDate: "2025-06-20",
    contractType: "Internship",
    action: "Apply"
  }
];

export const dashfeat = [
  {
    title: 'Create Job Post',
    image: createjobpost,
  },
  {
    title: 'Job Requisition',
    image: jobrequisition,
  },
  {
    title: 'Track Applicants',
    image: trackapplicants,
  },
];
