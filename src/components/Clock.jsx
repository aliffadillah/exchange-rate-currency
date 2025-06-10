import { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            // Add 7 hours for WIB timezone
            const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
            setTime(wibTime);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        const options = {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        const formatter = new Intl.DateTimeFormat('id-ID', options);
        const formattedDate = formatter.format(date);
        const [dayName, dateStr, timeStr] = formattedDate.split(' pukul ');
        
        return (
            <time dateTime={date.toISOString()}>
                <span className="time-date">{dayName}, {dateStr}</span>
                <span className="time-main">{timeStr} WIB</span>
            </time>
        );
    };

    return (
        <div className="stat-item">
            <span className="stat-icon">🕐</span>
            <span className="stat-text">
                {formatTime(time)}
            </span>
        </div>
    );
};

export default Clock;