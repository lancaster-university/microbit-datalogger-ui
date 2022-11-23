import "./Header.css";

export default function Header() {
    //@ts-ignore
    const isIE = Boolean(document.documentMode);

    return (
        <header>
            <div className="header-strip"></div>
            <div className="header-contents">
                <a href="https://microbit.org" target="_blank" rel="noopener">
                    <svg role="img" aria-labelledby="microbit-logo" viewBox="0 0 166.8 28.7" width="167" height="40"><title id="microbit-logo">micro:bit logo</title><path fill="#fff" d="M71.7 23.1h-3.3V14c0-2-1.2-3.5-2.8-3.5-1.6 0-2.8 1.4-2.8 3.5v9.1h-3.3V14c0-2.3-1.4-3.5-2.8-3.5-1.6 0-2.8 1.4-2.8 3.5v9.1h-3.3v-9c0-4.1 2.5-6.9 6.1-6.9 1.7 0 3.1.7 4.4 2.1 1.2-1.4 2.7-2.1 4.5-2.1 3.6 0 6 2.9 6 6.9v9zM77.7 23.1h-3.3V7.6h3.3v15.5zM76 5.3c-1.2 0-2.1-.9-2.1-2.1 0-1.2.9-2.1 2.1-2.1 1.2 0 2.1.9 2.1 2.1.1 1.2-.9 2.1-2.1 2.1zM88.1 23.5c-2.1 0-4.2-.9-5.7-2.4s-2.3-3.5-2.3-5.8c0-2.2.8-4.3 2.3-5.8C84 8.1 86 7.2 88.1 7.2c2.3 0 4.3.8 5.8 2.3l.4.4-2.3 2.4-.4-.4c-1.1-1-2.2-1.5-3.4-1.5-2.6 0-4.8 2.2-4.8 4.9s2.1 4.9 4.8 4.9c1.2 0 2.3-.5 3.4-1.4l.4-.4 2.4 2.3-.5.4c-1.8 1.6-3.7 2.4-5.8 2.4zM100.1 23.1h-3.5v-7.8c0-5 2.2-7.4 7-7.8l.7-.1v3.3l-.5.1c-2.6.3-3.6 1.5-3.6 4.3v8zM113.4 23.5c-2.1 0-4.2-.9-5.7-2.4s-2.3-3.6-2.3-5.8c0-2.2.8-4.2 2.3-5.8 1.5-1.6 3.5-2.4 5.7-2.4 2.1 0 4.1.9 5.6 2.4s2.3 3.6 2.3 5.8c0 2.2-.8 4.3-2.3 5.8-1.5 1.6-3.5 2.4-5.6 2.4zm-.1-13c-2.5 0-4.6 2.2-4.6 4.9s2.1 4.9 4.6 4.9c2.6 0 4.6-2.1 4.6-4.9.1-2.8-2-4.9-4.6-4.9zM126.8 23.1c-1.2 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.3 0 2.3 1 2.3 2.3-.1 1.3-1.1 2.3-2.3 2.3zM126.8 11.7c-1.2 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.3 0 2.3 1 2.3 2.3-.1 1.3-1.1 2.3-2.3 2.3zM140.2 23.5c-4.7 0-8-3.7-8-8.9V.2h3.3v8.5c1.4-1 3-1.5 4.7-1.5 2.1 0 4.1.8 5.6 2.4 1.5 1.5 2.3 3.6 2.3 5.8 0 2.2-.8 4.3-2.3 5.8-1.5 1.5-3.5 2.3-5.6 2.3zm0-13c-2.6 0-4.8 2.2-4.8 4.9s2.1 4.9 4.8 4.9c2.6 0 4.8-2.2 4.8-4.9-.1-2.7-2.2-4.9-4.8-4.9zM154.3 23.1H151V7.6h3.3v15.5zm-1.7-17.8c-1.2 0-2.1-.9-2.1-2.1 0-1.2.9-2.1 2.1-2.1 1.2 0 2.1.9 2.1 2.1.1 1.2-.9 2.1-2.1 2.1zM166.6 23.6l-.7-.1c-4.9-.9-6.7-3.3-6.7-8.6V11h-1.4V7.8h1.4V4.3h3.3v3.4h4.1v3.2h-4.1v4.4c0 2.9 1.1 4.4 3.6 4.7l.5.1v3.5z"></path><g fill="#fff"><path d="M32.5 18c1.5 0 2.6-1.2 2.6-2.6s-1.2-2.6-2.6-2.6c-1.5 0-2.6 1.2-2.6 2.6s1.2 2.6 2.6 2.6M13.3 12.8c-1.5 0-2.6 1.2-2.6 2.6s1.2 2.6 2.6 2.6c1.4 0 2.6-1.2 2.6-2.6s-1.2-2.6-2.6-2.6"></path><path d="M13.3 7.6c-4.3 0-7.8 3.5-7.8 7.8s3.5 7.8 7.8 7.8h19.5c4.3 0 7.8-3.5 7.8-7.8s-3.5-7.8-7.8-7.8H13.3m19.5 20.8H13.3c-7.2 0-13-5.8-13-13s5.8-13 13-13h19.5c7.2 0 13 5.8 13 13s-5.9 13-13 13"></path></g></svg>
                </a>
            </div>
            {isIE && 
            <div id="browser-warning">
                Internet Explorer (IE) is not supported. Please use Google Chrome, Microsoft Edge, Mozilla Firefox or Safari.
            </div>
            }
        </header>
    )
}