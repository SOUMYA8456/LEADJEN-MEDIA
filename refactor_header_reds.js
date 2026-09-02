const fs = require('fs');

let headerCode = fs.readFileSync('components/news/Header.tsx', 'utf8');

// 1. Remove shadows
headerCode = headerCode.replace(/backdrop-blur-md shadow-md border-b/g, 'backdrop-blur-md shadow-none border-b');
headerCode = headerCode.replace(/shadow-2xl/g, 'shadow-none');
headerCode = headerCode.replace(/shadow-xs/g, 'shadow-none');

// 2. Navigation items active state and hover state with #1E1B1A
headerCode = headerCode.replace(
  `                      active
                        ? "text-leadjen-600 dark:text-leadjen-400 font-extrabold bg-leadjen-100/70 dark:bg-leadjen-950/70 border-b-2 border-leadjen-600"
                        : "text-gray-700 dark:text-gray-300 hover:text-leadjen-600 dark:hover:text-leadjen-400 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"`,
  `                      active
                        ? "text-[#1E1B1A] dark:text-white font-extrabold bg-[#1E1B1A]/10 dark:bg-neutral-800 border-b-2 border-[#1E1B1A] dark:border-white shadow-none"
                        : "text-gray-700 dark:text-gray-300 hover:text-[#1E1B1A] dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800/60 shadow-none"`
);

// 3. MORE Button
headerCode = headerCode.replace(
  `                  className={\`flex items-center gap-1 px-3 py-1.5 rounded-md transition font-extrabold uppercase whitespace-nowrap \${
                    moreMenuOpen
                      ? "bg-gray-200 dark:bg-gray-800 text-leadjen-600 dark:text-leadjen-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-leadjen-600 dark:hover:text-leadjen-400 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
                  }\`}`,
  `                  className={\`flex items-center gap-1 px-3 py-1.5 rounded-md transition font-extrabold uppercase whitespace-nowrap \${
                    moreMenuOpen
                      ? "bg-gray-200 dark:bg-gray-800 text-[#1E1B1A] dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:text-[#1E1B1A] dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
                  }\`}`
);
headerCode = headerCode.replace('moreMenuOpen ? "rotate-180 text-leadjen-600" : ""', 'moreMenuOpen ? "rotate-180 text-[#1E1B1A] dark:text-white" : ""');

// 4. Watch and Listen buttons in header
headerCode = headerCode.replace('bg-leadjen-600 text-white shadow-xs', 'bg-[#1E1B1A] text-white shadow-none');
headerCode = headerCode.replace(/hover:text-leadjen-600 dark:hover:text-leadjen-400 hover:bg-gray-100/g, 'hover:text-[#1E1B1A] dark:hover:text-white hover:bg-gray-100');

// 5. In Mega Menu: headings and links
headerCode = headerCode.replace(/text-leadjen-600 dark:text-leadjen-400/g, 'text-[#1E1B1A] dark:text-white');
headerCode = headerCode.replace(/hover:text-leadjen-600 dark:hover:text-leadjen-400/g, 'hover:text-[#1E1B1A] dark:hover:text-white');
headerCode = headerCode.replace(/text-leadjen-600/g, 'text-[#1E1B1A]');
headerCode = headerCode.replace(/bg-leadjen-100 dark:bg-leadjen-950 text-leadjen-600/g, 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white');
headerCode = headerCode.replace(/bg-leadjen-50 text-leadjen-600 dark:bg-leadjen-950\/60 dark:text-leadjen-400/g, 'bg-[#1E1B1A]/10 text-[#1E1B1A] dark:bg-neutral-800 dark:text-white');

// Preserve Live news badge in mega menu and header
headerCode = headerCode.replace(/🔴 Live Developing Wire<\/Link>\s*<\/li>/g, '🔴 Live Developing Wire</Link></li>');

fs.writeFileSync('components/news/Header.tsx', headerCode, 'utf8');
console.log('Header.tsx refactored successfully!');
