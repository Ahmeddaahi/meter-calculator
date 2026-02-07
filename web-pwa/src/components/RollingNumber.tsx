import React from 'react';

interface RollingDigitProps {
    digit: string;
}

const RollingDigit: React.FC<RollingDigitProps> = ({ digit }) => {
    const isNumber = /\d/.test(digit);
    const numValue = isNumber ? parseInt(digit, 10) : 0;

    if (!isNumber) {
        return <span className="rolling-digit-static">{digit}</span>;
    }

    return (
        <div className="rolling-digit-container">
            <div
                className="rolling-digit-strip"
                style={{ transform: `translateY(-${numValue * 10}%)` }}
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="rolling-digit-value">
                        {n}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface RollingNumberProps {
    value: string | number;
    className?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({ value, className = '' }) => {
    const strValue = value.toString();
    const digits = strValue.split('');

    return (
        <div className={`rolling-number ${className}`}>
            {digits.map((digit, index) => (
                <RollingDigit key={`${index}-${digit}`} digit={digit} />
            ))}
        </div>
    );
};
