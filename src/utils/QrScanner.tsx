"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { X, RefreshCw } from "lucide-react";

type Props = {
  onScan: (data: string) => void;
  onClose: () => void;
};

export default function QrScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);

  const [cameras, setCameras] = useState<any[]>([]);
  const [cameraId, setCameraId] = useState<string | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();

        if (!devices.length) return;

        setCameras(devices);
        setCameraId(devices[0].id);

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          devices[0].id,
          {
            fps: 10,
            qrbox: 250,
          },
          async (decodedText) => {
            if (scannedRef.current) return;
            scannedRef.current = true;

            await html5QrCode.stop();
            scannerRef.current = null;

            onScan(decodedText);
          }
        );
      } catch (err) {
        console.error("Scanner error:", err);
      }
    };

    initScanner();

    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const switchCamera = async () => {
    if (!scannerRef.current || cameras.length < 2) return;

    const next = cameras.find((cam) => cam.id !== cameraId) || cameras[0];

    await scannerRef.current.stop();

    await scannerRef.current.start(
      next.id,
      {
        fps: 10,
        qrbox: 250,
      },
      async (decodedText) => {
        if (scannedRef.current) return;
        scannedRef.current = true;

        await scannerRef.current?.stop();
        scannerRef.current = null;

        onScan(decodedText);
      }
    );

    setCameraId(next.id);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">

        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h2 className="font-semibold text-lg">Scan QR Code</h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner */}
        <div className="p-4 flex justify-center">

          <div className="relative">

            <div
              id="reader"
              className="w-[280px] h-[280px] rounded-lg overflow-hidden border"
            />

            {/* Scan line */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="scan-line"></div>
            </div>

          </div>

        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 pb-5">

          <button
            onClick={switchCamera}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={16} />
            Switch
          </button>

        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Camera permission required
        </p>

      </div>

      <style jsx global>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: red;
          animation: scan 2s linear infinite;
        }

        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>

    </div>
  );
}