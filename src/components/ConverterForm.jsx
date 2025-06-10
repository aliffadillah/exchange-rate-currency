import { useEffect, useState } from "react";
import CurrencySelect from "./CurrencySelect";
import Clock from './Clock';

const ConversionHistory = ({ history, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="history-container">
            <button 
                className="history-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                📊 History ({history.length})
            </button>
            
            {isOpen && (
                <div className="history-dropdown">
                    <div className="history-header">
                        <h3>Conversion History</h3>
                        <button onClick={onClear} className="clear-btn">Clear</button>
                    </div>
                    <div className="history-list">
                        {history.length === 0 ? (
                            <p className="no-history">No conversions yet</p>
                        ) : (
                            history.map((item, index) => (
                                <div key={index} className="history-item">
                                    <span>{item.conversion}</span>
                                    <small>{item.timestamp}</small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const CurrencyTrend = ({ fromCurrency, toCurrency, exchangeRate }) => {
    const [trend, setTrend] = useState(null);
    const [previousRate, setPreviousRate] = useState(null);

    useEffect(() => {
        if (exchangeRate && previousRate) {
            const change = ((exchangeRate - previousRate) / previousRate) * 100;
            setTrend({
                direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
                percentage: Math.abs(change).toFixed(2)
            });
        }
        setPreviousRate(exchangeRate);
    }, [exchangeRate, previousRate]);

    if (!trend || !exchangeRate) return null;

    return (
        <div className="currency-trend">
            <div className="trend-indicator">
                <span className={`trend-icon trend-${trend.direction}`}>
                    {trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'}
                </span>
                <span className="trend-text">
                    {trend.direction === 'up' ? 'Rising' : trend.direction === 'down' ? 'Falling' : 'Stable'} 
                    {trend.percentage !== '0.00' && ` ${trend.percentage}%`}
                </span>
            </div>
        </div>
    );
};

const FavoritesCurrencies = ({ onSelectPair }) => {
    const [isOpen, setIsOpen] = useState(false);
    const favorites = [
        { from: 'USD', to: 'IDR', flag: '🇺🇸→🇮🇩' },
        { from: 'EUR', to: 'USD', flag: '🇪🇺→🇺🇸' },
        { from: 'GBP', to: 'USD', flag: '🇬🇧→🇺🇸' },
        { from: 'JPY', to: 'USD', flag: '🇯🇵→🇺🇸' },
        { from: 'USD', to: 'EUR', flag: '🇺🇸→🇪🇺' },
        { from: 'BTC', to: 'USD', flag: '₿→🇺🇸' }
    ];

    return (
        <div className="favorites-container">
            <button 
                className="favorites-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                ⭐ Quick Pairs
            </button>
            
            {isOpen && (
                <div className="favorites-grid">
                    {favorites.map((pair, index) => (
                        <button
                            key={index}
                            className="favorite-pair"
                            onClick={() => {
                                onSelectPair(pair.from, pair.to);
                                setIsOpen(false);
                            }}
                        >
                            <span className="pair-flag">{pair.flag}</span>
                            <span className="pair-text">{pair.from}/{pair.to}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CurrencyComparison = ({ exchangeRate, fromCurrency, toCurrency }) => {
    if (!exchangeRate) return null;

    const amounts = [1, 10, 100, 1000];
    
    return (
        <div className="currency-comparison">
            <h4 className="comparison-title">💰 Quick Comparison</h4>
            <div className="comparison-grid">
                {amounts.map(amount => (
                    <div key={amount} className="comparison-item">
                        <span className="amount">{amount} {fromCurrency}</span>
                        <span className="equals">=</span>
                        <span className="result">{(amount * exchangeRate).toFixed(2)} {toCurrency}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};  


const ConverterForm = () => {
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("IDR");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [nextUpdate, setNextUpdate] = useState(null);
    const [conversionCount, setConversionCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Function to format date with Indonesia timezone (WIB)
    const formatDateIndonesia = (date) => {
        if (!date) return '';
        
        // Convert to Indonesia timezone (UTC+7)
        const indonesiaTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        
        return indonesiaTime.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }) + ' WIB';
    };

    // Function to get current Indonesia time for history
    const getCurrentIndonesiaTime = () => {
        const now = new Date();
        return now.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }) + ' WIB';
    };

    // Load data from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('conversionHistory');
        const savedCount = localStorage.getItem('conversionCount');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
        if (savedCount) {
            setConversionCount(parseInt(savedCount));
        }
    }, []);

    // Save history to localStorage with Indonesia time
    const saveToHistory = (conversion) => {
        const newHistory = [
            {
                conversion,
                timestamp: getCurrentIndonesiaTime(), // Use Indonesia time
                rate: exchangeRate
            },
            ...history.slice(0, 9)
        ];
        setHistory(newHistory);
        localStorage.setItem('conversionHistory', JSON.stringify(newHistory));
        
        const newCount = conversionCount + 1;
        setConversionCount(newCount);
        localStorage.setItem('conversionCount', newCount.toString());
    };

    // Handle favorite pair selection
    const handleFavoritePair = (from, to) => {
        setFromCurrency(from);
        setToCurrency(to);
    };

    // Swap currencies
    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    }

    // Get exchange rate
    const getExchangeRate = async () => {
        const API_KEY = "4e6dc706492c003513958988";
        const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}`;

        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw Error("Something went wrong!");

            const data = await response.json();
            const rate = (data.conversion_rate * amount).toFixed(2);
            const conversionResult = `${amount} ${fromCurrency} = ${rate} ${toCurrency}`;
            
            setExchangeRate(data.conversion_rate);
            setResult(conversionResult);
            
            // Handle update times - convert to Indonesia timezone
            if (data.time_last_update_utc) {
                const utcDate = new Date(data.time_last_update_utc * 1000);
                setLastUpdate(utcDate);
            }
            if (data.time_next_update_utc) {
                const utcDate = new Date(data.time_next_update_utc * 1000);
                setNextUpdate(utcDate);
            }
            
            saveToHistory(conversionResult);
        } catch (error) {
            setResult("Something went wrong!");
        } finally {
            setIsLoading(false);
        }
    }

    // Handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault();
        getExchangeRate();
    }

    // Quick amount buttons
    const quickAmounts = [1, 10, 100, 1000];

    // Clear history
    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('conversionHistory');
    };

    // Calculate time until next update in Indonesia timezone
    const getTimeUntilUpdate = () => {
        if (!nextUpdate) return '';
        
        // Get current time in Indonesia
        const now = new Date();
        const indonesiaNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        const indonesiaNextUpdate = new Date(nextUpdate.getTime() + (7 * 60 * 60 * 1000));
        
        const diff = indonesiaNextUpdate - indonesiaNow;
        
        if (diff <= 0) return 'Tersedia sekarang';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours} jam ${minutes} menit lagi`;
        }
        return `${minutes} menit lagi`;
    };

    // Copy result to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        // You could add a toast notification here
    };

    // Add real-time clock update
    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            const now = new Date();
            // Add 7 hours for WIB timezone
            const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
            setCurrentTime(wibTime);
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timer);
    }, []);

    // Format current time for display
    const formatCurrentTime = (date) => {
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

        // Format full date and time
        const formatter = new Intl.DateTimeFormat('id-ID', options);
        const formattedDate = formatter.format(date);

        // Split into date and time components
        const [dayName, dateStr, timeStr] = formattedDate.split(' pukul ');
        
        return (
            <time dateTime={date.toISOString()}>
                <span className="time-date">{dayName}, {dateStr}</span>
                <span className="time-main">{timeStr} WIB</span>
            </time>
        );
    };

    useEffect(() => getExchangeRate, []);

    return (
        <div className="converter-content">
            {/* Stats Bar with Current Time */}
            <div className="grid-row row-1">
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-icon">🔄</span>
                        <span className="stat-text">{conversionCount} konversi</span>
                    </div>
                    <Clock />
                </div>
            </div>
            
            <FavoritesCurrencies onSelectPair={handleFavoritePair} />

            <form className="converter-form" onSubmit={handleFormSubmit}>
                <div className="form-group">
                    <label className="form-label">Enter Amount</label>
                    <div className="amount-input-container">
                        <input
                            type="number"
                            className="form-input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                        <div className="quick-amounts">
                            {quickAmounts.map(qty => (
                                <button
                                    key={qty}
                                    type="button"
                                    className={`quick-btn ${amount == qty ? 'active' : ''}`}
                                    onClick={() => setAmount(qty)}
                                >
                                    {qty}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-group form-currency-group">
                    <div className="form-section">
                        <label className="form-label">From</label>
                        <CurrencySelect
                            selectedCurrency={fromCurrency}
                            handleCurrency={e => setFromCurrency(e.target.value)}
                        />
                    </div>

                    <div className="swap-icon" onClick={handleSwapCurrencies}>
                        <svg width="16" viewBox="0 0 20 19" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.13 11.66H.22a.22.22 0 0 0-.22.22v1.62a.22.22 0 0 0 .22.22h16.45l-3.92 4.94a.22.22 0 0 0 .17.35h1.97c.13 0 .25-.06.33-.16l4.59-5.78a.9.9 0 0 0-.7-1.43zM19.78 5.29H3.34L7.26.35A.22.22 0 0 0 7.09 0H5.12a.22.22 0 0 0-.34.16L.19 5.94a.9.9 0 0 0 .68 1.4H19.78a.22.22 0 0 0 .22-.22V5.51a.22.22 0 0 0-.22-.22z"
                                fill="#fff" />
                        </svg>
                    </div>

                    <div className="form-section">
                        <label className="form-label">To</label>
                        <CurrencySelect
                            selectedCurrency={toCurrency}
                            handleCurrency={e => setToCurrency(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className={`${isLoading ? "loading" : ""} submit-button`}>
                    {isLoading ? "Converting..." : "Get Exchange Rate"}
                </button>
                
                <div className="exchange-rate-result">
                    <div className="result-main">
                        {isLoading ? "Getting exchange rate..." : result}
                        {result && !isLoading && (
                            <button className="copy-btn" onClick={copyToClipboard} title="Copy to clipboard">
                                📋
                            </button>
                        )}
                    </div>
                    {exchangeRate && !isLoading && (
                        <div className="rate-info">
                            <small>1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</small>
                        </div>
                    )}
                    <CurrencyTrend 
                        fromCurrency={fromCurrency} 
                        toCurrency={toCurrency} 
                        exchangeRate={exchangeRate} 
                    />
                </div>
            </form>

            <CurrencyComparison 
                exchangeRate={exchangeRate} 
                fromCurrency={fromCurrency} 
                toCurrency={toCurrency} 
            />

            <ConversionHistory history={history} onClear={clearHistory} />

            
        </div>
    )
}

export default ConverterForm;