"use client";

import { LaptopChromebook } from "@mui/icons-material";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

const btnBase: React.CSSProperties = {
    padding: "6px 20px",
    borderRadius: 9999,
    border: "2px solid #fff",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    background: "transparent",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    whiteSpace: "nowrap",
};

export default function AppBanner() {
    return (
        <>
            <style>{`
        .banner-mobile  { display: flex; }
        .banner-desktop { display: none; }
        @media (min-width: 1000px) {
          .banner-mobile  { display: none; }
          .banner-desktop { display: flex; }
        }
      `}</style>

            <div className="w-full flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8">

                {/* ── < 1000px : two stacked full pills ── */}
                <div className="banner-mobile flex-col gap-4 w-full max-w-lg">

                    {/* App pill */}
                    <div
                        className="flex items-center gap-4 bg-[#1a2447] w-full"
                        style={{ borderRadius: 9999, height: 90, paddingLeft: 16, paddingRight: 24 }}
                    >
                        <div
                            className="flex-shrink-0 rounded-full bg-[#4dc8c8] flex items-center justify-center"
                            style={{ width: 50, height: 50, marginLeft: 12 }}
                        >
                            <PhoneAndroidIcon sx={{ color: "#fff", fontSize: 24 }} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <p className="text-white font-bold leading-tight" style={{ fontSize: 14 }}>
                                Download our App to know more
                            </p>
                            <button
                                style={{ ...btnBase, alignSelf: "flex-start", fontSize: 12, padding: "4px 16px" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a2447"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                            >
                                Download Now
                            </button>
                        </div>
                    </div>

                    {/* Website pill */}
                    <div
                        className="flex items-center justify-between gap-4 bg-[#07881f] w-full"
                        style={{ borderRadius: 9999, height: 90, paddingLeft: 24, paddingRight: 16 }}
                    >
                        <div className="flex flex-col gap-1.5">
                            <p className="text-white font-bold leading-tight" style={{ fontSize: 14 }}>
                                Join Our Website
                            </p>
                            <button
                                style={{ ...btnBase, alignSelf: "flex-start", fontSize: 12, padding: "4px 16px" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#07881f"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                            >
                                Join Now
                            </button>
                        </div>
                        <div
                            className="flex-shrink-0 rounded-full bg-[#e06b10] flex items-center justify-center"
                            style={{ width: 50, height: 50, marginRight: 12 }}
                        >
                            <LaptopChromebook sx={{ color: "#fff", fontSize: 22 }} />
                        </div>
                    </div>
                </div>

                {/* ── ≥ 1000px : single split pill with illustration ── */}
                <div className="banner-desktop relative items-center w-full max-w-6xl overflow-visible" style={{ height: 120 }}>

                    {/* Left navy half */}
                    <div
                        className="flex items-center gap-5 bg-[#1a2447] h-full flex-1"
                        style={{ borderRadius: "9999px 0 0 9999px", paddingLeft: 28, paddingRight: 80 }}
                    >
                        <div
                            className="flex-shrink-0 rounded-full bg-[#4dc8c8] flex items-center justify-center"
                            style={{ width: 54, height: 54, marginLeft: 16 }}
                        >
                            <PhoneAndroidIcon sx={{ color: "#fff", fontSize: 28 }} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-white font-bold text-[18px] leading-tight whitespace-nowrap">
                                Download our App to know more
                            </p>
                            <button
                                style={{ ...btnBase, alignSelf: "flex-start" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a2447"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                            >
                                Download Now
                            </button>
                        </div>
                    </div>

                    {/* Right green half */}
                    <div
                        className="flex items-center justify-end gap-5 bg-[#07881f] h-full flex-1"
                        style={{ borderRadius: "0 9999px 9999px 0", paddingLeft: 80, paddingRight: 28 }}
                    >
                        <div className="flex flex-col gap-2 items-end">
                            <p className="text-white font-bold text-[18px] leading-tight whitespace-nowrap">
                                Join Our Website
                            </p>
                            <button
                                style={{ ...btnBase, alignSelf: "flex-end" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#07881f"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                            >
                                Join Now
                            </button>
                        </div>
                        <div
                            className="flex-shrink-0 rounded-full bg-[#e06b10] flex items-center justify-center"
                            style={{ width: 52, height: 52, marginRight: 16 }}
                        >
                            <LaptopChromebook sx={{ color: "#fff", fontSize: 22 }} />
                        </div>
                    </div>

                    {/* Center illustration */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10 pointer-events-none"
                        style={{ width: 170, height: 170 }}
                    >
                        <img
                            src="/bannerapp.png"
                            alt="Student illustration"
                            width={170}
                            height={170}
                            className="object-contain w-full h-full"
                        />
                    </div>
                </div>

            </div>
        </>
    );
}