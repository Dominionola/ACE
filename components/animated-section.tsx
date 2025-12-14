"use client";

import React, { useRef, useEffect, useState } from "react";

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // delay in ms
}

export function AnimatedSection({
    children,
    className = "",
    delay = 0,
}: AnimatedSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Add delay before triggering animation
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    // Unobserve after triggering
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`${className} ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                } transition-all duration-700 ease-out`}
        >
            {children}
        </div>
    );
}
