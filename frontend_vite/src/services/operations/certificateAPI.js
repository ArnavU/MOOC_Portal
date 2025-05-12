import toast from 'react-hot-toast';
import { apiConnector } from '../apiConnector';
import { CERTIFICATE_API } from '../apis';
import axios from 'axios';



export const downloadCertificate = async (courseId) => {
    const toastId = toast.loading("Generating certificate...");
    try {
        const response = await axios.get(
        `http://localhost:5000/api/v1/certificate/generate/${courseId}`, // Replace with your backend endpoint
        {
          withCredentials: true, // Include credentials (cookies) in the request
          responseType: "blob", // Important for handling binary data
        }
      );

      // Create a Blob from the response
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary URL for the Blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Option 1: Trigger download
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "certificate.pdf"; // Filename for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Option 2: Display in browser (uncomment to use)
      // window.open(pdfUrl);

      // Clean up
      window.URL.revokeObjectURL(pdfUrl);
    } catch (error) {
        console.error('Error Downloading certificate:', error);
        throw error;
    }
    finally {
        toast.dismiss(toastId);
    }
};

export const getCertificate = async (courseId) => {
  const toastId = toast.loading("Generating certificate...");
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/certificate/generate/${courseId}`,
      {
        withCredentials: true,
        responseType: "blob",
      }
    );

    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    // Return the blob URL instead of downloading
    return pdfUrl;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};