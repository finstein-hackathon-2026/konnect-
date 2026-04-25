"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { verifyJobByQR } from "@/services/jobService";

type ScanState = "scanning" | "success" | "error";

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (!mounted) return;

            // Stop scanning immediately after a read
            try {
              await scanner.stop();
            } catch (e) {
              // ignore stop errors
            }

            try {
              const isValid = await verifyJobByQR(jobId, decodedText);
              if (isValid) {
                setScanState("success");
              } else {
                setErrorMsg("QR code does not match this job. Please scan the correct code.");
                setScanState("error");
              }
            } catch (err: any) {
              setErrorMsg(err.message || "Verification failed. Please try again.");
              setScanState("error");
            }
          },
          () => {
            // QR scan error (frame without QR) — ignore silently
          }
        );
      } catch (err: any) {
        if (mounted) {
          setErrorMsg("Camera access denied. Please allow camera permissions and try again.");
          setScanState("error");
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [jobId]);

  const handleRetry = () => {
    setScanState("scanning");
    setErrorMsg("");
    // Re-mount the scanner by reloading the page
    window.location.reload();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen">
      <Header />

      <motion.main
        className="mx-auto max-w-lg px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back link */}
        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => router.push(`/jobs/${jobId}`)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to job
          </button>
        </motion.div>

        {/* Scanning State */}
        {scanState === "scanning" && (
          <motion.div variants={itemVariants}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
                <ScanLine className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-2">Scan QR Code</h1>
              <p className="text-gray-500">Point your camera at the worker&apos;s QR code to verify their identity</p>
            </div>

            <Card className="p-0 overflow-hidden mb-8">
              <div
                id="qr-reader"
                ref={containerRef}
                className="w-full"
                style={{ minHeight: 300 }}
              />
            </Card>

            <p className="text-center text-sm text-gray-400">
              Make sure the QR code is well-lit and within the frame
            </p>
          </motion.div>
        )}

        {/* Success State */}
        {scanState === "success" && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight text-green-600 dark:text-green-400 mb-2">
              Verified!
            </h1>
            <p className="text-gray-500 mb-10">
              The worker&apos;s identity has been confirmed. Your job is now verified.
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push(`/jobs/${jobId}`)}
            >
              Back to Job
            </Button>
          </motion.div>
        )}

        {/* Error State */}
        {scanState === "error" && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-500 mb-10">
              {errorMsg}
            </p>
            <div className="space-y-3">
              <Button variant="primary" className="w-full" onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push(`/jobs/${jobId}`)}>
                Back to Job
              </Button>
            </div>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
