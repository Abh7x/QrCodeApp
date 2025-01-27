// Filename: QRCodeApp.jsx

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrReader } from "react-qr-reader";
import QRCode from "qrcode.react";

/*
  Adjustments per user request:
    - If the user’s device has no camera or denies permission, show a warning.
    - Remove the restriction on empty text (can generate an empty QR code).
    - The text can handle quotation marks (e.g., "Hello, \"World\"").
    - Prompt user for camera permission or show a warning if not available.
*/

// (Optional) If you want CSV parsing, encryption, etc., install and import them as needed:
// import Papa from "papaparse"; // CSV parsing
// import CryptoJS from "crypto-js"; // Encryption
// import JSZip from "jszip"; // For zipping multiple codes
// import { saveAs } from "file-saver"; // For saving the zip file
// import { useBarcode } from "react-barcodes"; // For barcodes if needed

// i18n dictionaries
const translations = {
  en: {
    title: "QR Code Generator & Scanner",
    enterText: "Enter text to generate:",
    generateQR: "Generate QR",
    downloadQR: "Download QR",
    shareQR: "Share QR",
    startScanner: "Start Scanner",
    stopScanner: "Stop Scanner",
    scanningPrompt: "Point the camera at a QR code",
    scannedResult: "Scanned Result:",
    copyScannedText: "Copy Scanned Text",
    textCopied: "Scanned text copied to clipboard!",
    noTextAlert: "Please enter text to generate a QR code.",
    errorScanning: "Error scanning QR code. Please try again.",
    shareNotSupported: "Sharing is not supported on your device/browser.",
    shareFail: "Sharing failed. Please try again.",
    languageLabel: "Language:",
    encryptionLabel: "Encrypt Message?",
    passwordPlaceholder: "Enter Encryption Password",
    foregroundColor: "Foreground Color:",
    backgroundColor: "Background Color:",
    codeTypeLabel: "Code Type:",
    favorites: "Favorites",
    addFavorite: "★",
    removeFavorite: "☆",
    viewHistory: "View History",
    hideHistory: "Hide History",
    historyTitle: "Generation & Scan History",
    loadCSV: "Load CSV",
    generateBulk: "Generate Bulk Codes",
    bulkTitle: "Bulk Generated Codes",
    cameraWarning: "Camera not available or permission denied. Please enable camera permissions.",
  },
  es: {
    title: "Generador y Lector de Códigos QR",
    enterText: "Introduce texto para generar:",
    generateQR: "Generar QR",
    downloadQR: "Descargar QR",
    shareQR: "Compartir QR",
    startScanner: "Iniciar Escáner",
    stopScanner: "Detener Escáner",
    scanningPrompt: "Apunta la cámara hacia un código QR",
    scannedResult: "Resultado Escaneado:",
    copyScannedText: "Copiar Texto Escaneado",
    textCopied: "¡Texto escaneado copiado al portapapeles!",
    noTextAlert: "Por favor, introduce texto para generar un código QR.",
    errorScanning: "Error al escanear el código QR. Inténtalo de nuevo.",
    shareNotSupported: "Tu dispositivo/navegador no soporta compartir.",
    shareFail: "El compartido ha fallado. Inténtalo de nuevo.",
    languageLabel: "Idioma:",
    encryptionLabel: "¿Encriptar Mensaje?",
    passwordPlaceholder: "Introduce Contraseña",
    foregroundColor: "Color de Primer Plano:",
    backgroundColor: "Color de Fondo:",
    codeTypeLabel: "Tipo de Código:",
    favorites: "Favoritos",
    addFavorite: "★",
    removeFavorite: "☆",
    viewHistory: "Ver Historial",
    hideHistory: "Ocultar Historial",
    historyTitle: "Historial de Generación y Escaneo",
    loadCSV: "Cargar CSV",
    generateBulk: "Generar Códigos Masivos",
    bulkTitle: "Códigos Generados en Masa",
    cameraWarning: "Cámara no disponible o permiso denegado. Habilite los permisos de la cámara.",
  },
};

const QRCodeApp = () => {
  // Basic states
  const [text, setText] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const qrRef = useRef(null);

  // For i18n
  const [language, setLanguage] = useState("en");

  // For customizing QR color
  const [qrForeground, setQrForeground] = useState("#000000");
  const [qrBackground, setQrBackground] = useState("#ffffff");

  // For encryption
  const [useEncryption, setUseEncryption] = useState(false);
  const [password, setPassword] = useState("");

  // For code type switching (qrcode, barcode, etc.)
  const [codeType, setCodeType] = useState("qrcode");

  // For storing history (generated and scanned codes)
  // { type: 'generated' | 'scanned', value: string, date: number, favorite: boolean }
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // For multi-code generation from CSV (placeholder)
  const [bulkCodes, setBulkCodes] = useState([]);

  // For local analytics (scan count)
  const [scanCount, setScanCount] = useState(0);

  // Show a camera-specific warning if no camera or permission denied.
  const [cameraWarning, setCameraWarning] = useState("");

  // i18n helper
  const t = (key) => translations[language][key] || key;

  // Load from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("qrHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    const storedScanCount = localStorage.getItem("scanCount");
    if (storedScanCount) {
      setScanCount(parseInt(storedScanCount, 10));
    }
  }, []);

  // Save history and scanCount to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("qrHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("scanCount", scanCount);
  }, [scanCount]);

  // Generate code handler
  // The user can generate a QR code for empty text.
  const handleGenerate = () => {
    // Encryption placeholder
    let finalText = text;
    // if (useEncryption && password) {
    //   const encrypted = CryptoJS.AES.encrypt(text, password).toString();
    //   finalText = encrypted;
    // }

    // Add to history
    const newEntry = {
      type: "generated",
      value: finalText,
      date: Date.now(),
      favorite: false,
    };
    setHistory((prev) => [...prev, newEntry]);
  };

  // Handle scanning success
  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
      setShowScanner(false);
      setScanCount((prev) => prev + 1);

      // If encryption is turned on, attempt decryption (placeholder)
      // if (useEncryption && password) { ... }

      const newEntry = {
        type: "scanned",
        value: data,
        date: Date.now(),
        favorite: false,
      };
      setHistory((prev) => [...prev, newEntry]);
    }
  };

  // Handle scanning error
  const handleError = (error) => {
    console.error(error);
    if (error?.name === "NotAllowedError" || error?.name === "NotFoundError") {
      setCameraWarning(t("cameraWarning"));
    } else {
      alert(t("errorScanning"));
    }
  };

  // Download the generated QR code as a PNG
  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "qr_code.png";
    link.click();
  };

  // Share the generated QR code via the Web Share API
  const handleShare = async () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "qr_code.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "QR Code",
            text: "Check out this QR code!",
          });
        } catch (error) {
          console.log(t("shareFail"), error);
          alert(t("shareFail"));
        }
      } else {
        alert(t("shareNotSupported"));
      }
    });
  };

  // Copy scanned text
  const handleCopyScanResult = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      alert(t("textCopied"));
    }
  };

  // Toggle favorite
  const toggleFavorite = (index) => {
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory[index].favorite = !newHistory[index].favorite;
      return newHistory;
    });
  };

  // handleAutoAction:
  //  - tel: => open in different tab
  //  - mailto: => confirm first, then open in same tab if confirmed
  //  - https => open in new tab
  const handleAutoAction = (data) => {
    if (!data) return;

    if (/^tel:\d+/.test(data)) {
      window.open(data, "_blank");
      return;
    }
    if (/^mailto:/.test(data)) {
      const confirmed = window.confirm(
        `Do you want to open your mail client for ${data.replace(/^mailto:/, "")}?`
      );
      if (confirmed) {
        window.open(data, "_self");
      }
      return;
    }
    if (/^https?:\/\//.test(data)) {
      window.open(data, "_blank");
      return;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <label className="mr-2">{t("languageLabel")}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded p-1"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">
          {t("title")}
        </h1>

        {/* Generator Card */}
        <Card className="mb-6 shadow-lg rounded-2xl p-4">
          <CardContent className="flex flex-col gap-4">
            <label className="font-semibold">{t("enterText")}</label>
            <Input
              type="text"
              placeholder={t("enterText")}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Encryption Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useEncryption}
                onChange={() => setUseEncryption(!useEncryption)}
              />
              <label>{t("encryptionLabel")}</label>
            </div>

            {useEncryption && (
              <Input
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            {/* Color Pickers */}
            <div className="flex items-center gap-4">
              <div>
                <label className="mr-2">{t("foregroundColor")}</label>
                <input
                  type="color"
                  value={qrForeground}
                  onChange={(e) => setQrForeground(e.target.value)}
                />
              </div>
              <div>
                <label className="mr-2">{t("backgroundColor")}</label>
                <input
                  type="color"
                  value={qrBackground}
                  onChange={(e) => setQrBackground(e.target.value)}
                />
              </div>
            </div>

            {/* Code Type Switch */}
            <div className="flex items-center gap-2">
              <label>{t("codeTypeLabel")}</label>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value)}
                className="border rounded p-1"
              >
                <option value="qrcode">QR Code</option>
                <option value="barcode">Barcode (Placeholder)</option>
              </select>
            </div>

            <Button onClick={handleGenerate}>{t("generateQR")}</Button>

            {/* Always show generated code area, even if text is empty */}
            <div
              ref={qrRef}
              className="flex flex-col items-center justify-center mt-4 gap-2"
            >
              {codeType === "qrcode" && (
                <QRCode
                  value={text}
                  size={150}
                  fgColor={qrForeground}
                  bgColor={qrBackground}
                />
              )}
              {codeType === "barcode" && (
                <div className="text-sm text-gray-500">
                  Barcode placeholder (Requires additional library)
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleDownload}>
                  {t("downloadQR")}
                </Button>
                <Button variant="secondary" onClick={handleShare}>
                  {t("shareQR")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scanner Card */}
        <Card className="mb-6 shadow-lg rounded-2xl p-4">
          <CardContent className="flex flex-col gap-4">
            <Button
              onClick={() => {
                setShowScanner(!showScanner);
                setCameraWarning(""); // reset camera warning whenever toggling
              }}
            >
              {showScanner ? t("stopScanner") : t("startScanner")}
            </Button>
            {showScanner && (
              <div className="w-full flex flex-col items-center mt-4">
                <QrReader
                  onResult={(result, error) => {
                    if (!!result) {
                      handleScan(result?.text);
                      handleAutoAction(result?.text);
                    }
                    if (!!error) {
                      // handle errors such as permission denied
                      handleError(error);
                    }
                  }}
                  style={{ width: "100%" }}
                  constraints={{ facingMode: "environment" }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {t("scanningPrompt")}
                </p>
                {cameraWarning && (
                  <p className="text-red-500 text-sm mt-2">{cameraWarning}</p>
                )}
              </div>
            )}

            {/* Show scanned result if available */}
            {scanResult && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="font-semibold">{t("scannedResult")}</p>
                <p className="bg-gray-100 p-2 rounded">{scanResult}</p>
                <Button variant="secondary" onClick={handleCopyScanResult}>
                  {t("copyScannedText")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show/hide history */}
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="mb-4"
        >
          {showHistory ? t("hideHistory") : t("viewHistory")}
        </Button>

        {showHistory && (
          <Card className="mb-6 shadow-lg rounded-2xl p-4">
            <CardContent className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">{t("historyTitle")}</h2>
              <p className="text-sm text-gray-500">(Total Scans: {scanCount})</p>

              {history.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto">
                  {history
                    .slice()
                    .reverse()
                    .map((entry, idx) => {
                      const index = history.length - 1 - idx; // actual index in array
                      return (
                        <li
                          key={entry.date}
                          className="border-b border-gray-200 py-2 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-semibold">
                              {entry.type.toUpperCase()} -{" "}
                              {new Date(entry.date).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {entry.value}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleFavorite(index)}
                            className="text-xl"
                          >
                            {entry.favorite
                              ? t("removeFavorite")
                              : t("addFavorite")}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No history yet.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bulk CSV Section Placeholder */}
        {/**
         * <Card className="mb-6 shadow-lg rounded-2xl p-4">
         *   <CardContent className="flex flex-col gap-4">
         *     <h2 className="text-xl font-bold">{t("bulkTitle")}</h2>
         *     <div>
         *       <input type="file" accept=".csv" onChange={handleCSVUpload} />
         *       <Button onClick={handleBulkGenerate}>{t("generateBulk")}</Button>
         *     </div>
         *     {bulkCodes.length > 0 && (
         *       <ul>
         *         {bulkCodes.map((codeItem, i) => (
         *           <li key={i}>{codeItem}</li>
         *         ))}
         *       </ul>
         *     )}
         *   </CardContent>
         * </Card>
         */}
      </motion.div>
    </div>
  );
};

export default QRCodeApp;

/*
  Basic Additional Test Cases:

  1. Generate an empty QR code (text=""). Expect the code to still be generated.
     - The QR code should encode an empty string.
     - The user should see a blank or minimal code.

  2. Generate a QR code containing quotes, e.g. "Hello, \"World\"". Confirm it appears.

  3. Deny camera permission when scanning:
     - Expect a warning in red: "Camera not available or permission denied..."

  4. No camera on device:
     - Expect the same warning.

  5. Accept camera permission:
     - The scanning should proceed.
*/
