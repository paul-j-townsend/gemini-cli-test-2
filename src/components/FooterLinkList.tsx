import Link from 'next/link';
import React from 'react';

interface FooterLinkListProps {
  title: string;
  links: { label: string; href: string }[];
}

const FooterLinkList: React.FC<FooterLinkListProps> = ({ title, links }) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-6 text-white">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link 
              href={link.href}
              className="text-emerald-300 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 transform inline-block"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterLinkList;