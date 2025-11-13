import React from 'react';
import { Facebook, Linkedin } from 'lucide-react';
import UlwembuWhiteLogo from '../../assets/UlwembuWhiteLogo.png';

const Footer = () => {
return (
    <footer
    className="text-white py-2 relative z-10 mt-2"
    style={{
        backgroundColor: '#0099CE',
        backgroundImage: "url('https://www.ulwembubs.com/assets/img/blue.jpg')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        minHeight: 'fit-content'
    }}
    >
    <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Logo and About Section */}
        <div className="space-y-2">
            <a href="index.html">
            <img
                className="w-32"
                src={UlwembuWhiteLogo}
                alt="Ulwembu Logo"
            />
            </a>
            <p className="text-xs py-2">
            Ulwembu Business Services is a black owned company that offers management
            consulting and ICT services that optimise and digitise private and public organisations.
            </p>
        </div>

          {/* Contact Us Section */}
        <div className="space-y-2">
            <h2 className="text-sm font-bold border-b border-blue-700 pb-1">Contact us</h2>
            <p className="text-xs">10 Waterford Office Park, Fourways, Johannesburg, 2191</p>
            <div className="text-xs">
            <span className="font-bold">Phone:</span>
            <p>010 035 0029</p>
            </div>
            <div className="space-y-0.5">
            <span className="font-bold">Email:</span>
            <div className="flex flex-col">
                <a href="mailto:sales@ulwembubs.com" className="hover:text-blue-300">sales@ulwembubs.com</a>
                <a href="mailto:recruitment@ulwembubs.com" className="hover:text-blue-300">recruitment@ulwembubs.com</a>
                <a href="mailto:hr@ulwembubs.com" className="hover:text-blue-300">hr@ulwembubs.com</a>
            </div>
            </div>
        </div>

          {/* Resources Section */}
        <div className="space-y-2">
            <h2 className="text-sm font-bold border-b border-blue-700 pb-1">Resources</h2>
            <ul className="space-y-1 text-xs">
            <li><a href="/public/Ulwembu Business Process Outsourcing 062019.pdf" target='_blank' className="hover:text-blue-300" >› Business Process Outsourcing</a></li>
            <li><a href="/public/Ulwembu Smart Business 062019.pdf" target='_blank' className="hover:text-blue-300" >› Business Solutions</a></li>
            <li><a href="/public/Ulwembu Health Management 072021.pdf" target='_blank' className="hover:text-blue-300" >› Health Management System (ul-HMS)</a></li>
            <li><a href="/public/Ulwembu Health Management 072021.pdf" target='_blank' className="hover:text-blue-300" >› Health Management System (ul-HMS)</a></li>
            <li><a href="/public/files/Ulwembu ICT Infrastructure 062019.pdf" target='_blank' className="hover:text-blue-300" >› ICT Infrastructure</a></li>
            <li><a href="/public/files/Ulwembu Networking and Cabling" target='_blank' className="hover:text-blue-300" >› Networking and Cabling</a></li>
            <li><a href="/public/files/Ulwembu Organisational design, development and change management 062019.pdf" target='_blank' className="hover:text-blue-300" >› Organisational Design, Development and Change Management</a></li>
            <li><a href="/public/files/Ulwembu Enterprise Programme Management Office 062019.pdf" target='_blank' className="hover:text-blue-300" >› Programme Management Office</a></li>
            <li><a href="/public/files/Ulwembu Systems Automation 062019.pdf" target='_blank' className="hover:text-blue-300" >› Systems Automation</a></li>
            <li><a href="/public/files/Ulwembu Systems Intergration 062019.pdf" target='_blank' className="hover:text-blue-300" >› Systems Integration</a></li>
            </ul>
        </div>

          {/* Useful Links Section */}
        <div className="space-y-2">
            <h2 className="text-sm font-bold border-b border-blue-700 pb-1">Useful Links</h2>
            <ul className="space-y-1 text-xs">
            <li><a href="#" className="hover:text-blue-300">› Company profile</a></li>
            <li><a href="/public/BBBEE-2021.pdf" target='_blank' className="hover:text-blue-300">› Empowerment certificate</a></li>
            </ul>

            <div className="flex space-x-3 mt-4">
            <a href="https://www.facebook.com/UlwembuBusinessServices/" className="w-6 h-6 rounded-full bg-white text-blue-800 flex items-center justify-center hover:text-blue-600">
                <span className="sr-only">Facebook</span>
                <Facebook className="w-3 h-3" />
            </a>
            <a href="https://www.linkedin.com/company/ulwembubs/" className="w-6 h-6 rounded-full bg-white text-blue-800 flex items-center justify-center hover:text-blue-600">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-3 h-3" />
            </a>
            </div>
        </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-blue-700 mt-4 pt-2 text-xs">
        <div className="flex flex-wrap justify-between">
            <div>2025 © All Rights Reserved.</div>
            <div className="flex space-x-3">
            <a href="https://www.ulwembubs.com/disclaimer.html" className="hover:text-blue-300">Disclaimer</a>
            <a href="/public/Ulwembu Cookie Policy 2021.pdf" target='_blank' className="hover:text-blue-300">Cookie policy</a>
            </div>
        </div>
        </div>
    </div>
    </footer>
);
};

export default Footer;