"use client";

import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface JitsiMeetingProps {
    roomName: string;
    userName: string;
    onClose?: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function JitsiMeeting({ roomName, userName, onClose }: JitsiMeetingProps) {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);

    const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';

    const startConference = () => {
        if (jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
            const options = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: userName
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    disableDeepLinking: true,
                    prejoinPageEnabled: false
                },
                interfaceConfigOverwrite: {
                    // You can customize the UI here
                    SHOW_JITSI_WATERMARK: false,
                }
            };

            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
                if (onClose) onClose();
            });
        }
    };

    useEffect(() => {
        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, []);

    return (
        <>
            <Script
                src={`https://${domain}/external_api.js`}
                onLoad={startConference}
            />
            <div
                ref={jitsiContainerRef}
                style={{ width: '100%', height: '100%', minHeight: '600px' }}
                className="rounded-[2.5rem] overflow-hidden"
            />
        </>
    );
}
