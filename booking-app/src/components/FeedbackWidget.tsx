'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function FeedbackWidget() {
    useEffect(() => {
        // Configure the feedback widget
        if (typeof window !== 'undefined') {
            (window as any).FeedbackApp = {
                projectId: "0bQchrHhg3OHZ6ORkSYF",
                theme: "dark", // Changed to dark to match your app theme
                position: "bottom-right",
                primaryColor: "#EAB308", // Gold color to match your brand
                buttonText: "Feedback",
                welcomeMessage: "Please provide feedback",
                categories: ["general", "bug", "feature", "improvement", "question"]
            };
        }
    }, []);

    return (
        <>
            <Script
                src="https://develop.d9chi2hq3bkdj.amplifyapp.com/widget.iife.js"
                strategy="lazyOnload"
            />
            <link
                rel="stylesheet"
                href="https://develop.d9chi2hq3bkdj.amplifyapp.com/widget.css"
            />
        </>
    );
}
