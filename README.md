General Installation Tips:
Choose your package manager: Use either npm or yarn. Most React projects these days come with npm by default, but you can switch to yarn if you prefer.
Add the libraries: Run the appropriate npm install <package-name> or yarn add <package-name> command in your project root directory (where package.json is located).
Import where needed: In your JavaScript/TypeScript files, import the library to use it:
import LibraryName from 'library-name';
or for named exports:
import { NamedExport } from 'library-name';
Verify versions: Check your package.json or run npm list <package-name> (or yarn list --pattern <package-name>) to confirm the installation.

1. Papa Parse
Why you might need it:
Papa Parse is a widely used JavaScript library for reading and parsing CSV files.
It can parse local CSV files, remote CSV files (via URLs), and handle file uploads easily.
It supports both synchronous and asynchronous (streaming) parsing.

2. Crypto-JS
Why you might need it:
Crypto-JS is used for cryptographic functions such as hashing, encryption, and decryption in JavaScript.
Commonly needed for securely handling data (e.g., generating MD5, SHA1, or SHA256 hashes).

3. JSZip
Why you might need it:
JSZip is a JavaScript library for creating, reading, and editing .zip files on the client side.
Useful when you need to bundle multiple files for users to download in a single compressed archive.

4. FileSaver
Why you might need it:
FileSaver (sometimes referred to as file-saver) allows you to save files directly to a user’s machine from the browser (e.g., saving PDFs, CSVs, text files, etc.).
Especially helpful for client-side generation and immediate download of files.

5. react-barcodes (or react-barcode)
Why you might need it:
This library generates barcodes in React applications.
If you need to display or generate barcodes on the fly (e.g., shipping labels, product labels), libraries like react-barcodes or react-barcode can render them as SVG or Canvas elements.
