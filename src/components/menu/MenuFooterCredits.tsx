import React from 'react';

/**
 * MenuFooterCredits renders the author attribution and external profile links.
 */
export const MenuFooterCredits: React.FC = () => {
  return (
    <div className="pt-6 border-t border-[#E5A91A]/20 flex flex-col items-center justify-center space-y-3">
      <div className="flex items-center justify-center gap-3.5">
        {/* GitHub */}
        <a
          href="https://github.com/if-else-repeat"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border-2 border-[#E5A91A] bg-[#0A0A0A] text-[#E5A91A] hover:border-[#238636] hover:text-[#238636] hover:bg-[#238636]/15 active:bg-[#238636] active:border-[#238636] active:text-[#0A0A0A] flex items-center justify-center transition-all cursor-pointer shadow-md select-none group"
          title="GitHub: if-else-repeat"
          aria-label="GitHub Profile"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/priyanshu-raj-mishra"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border-2 border-[#E5A91A] bg-[#0A0A0A] text-[#E5A91A] hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/15 active:bg-[#0A66C2] active:border-[#0A66C2] active:text-white flex items-center justify-center transition-all cursor-pointer shadow-md select-none group"
          title="LinkedIn: priyanshu-raj-mishra"
          aria-label="LinkedIn Profile"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
          </svg>
        </a>
      </div>

      <div className="text-center pt-1">
        <a
          href="https://oldmill.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold tracking-widest uppercase text-[#E5A91A] hover:text-[#E5A91A] hover:underline transition-colors cursor-pointer select-none inline-block"
        >
          AN OLDMILL PROJECT
        </a>
      </div>
    </div>
  );
};
