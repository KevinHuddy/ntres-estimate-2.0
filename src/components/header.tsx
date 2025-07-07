function Header({ children }: { children?: React.ReactNode }) {
    return (
        <header className="bg-background sticky top-0 z-50 w-full py-3 border-b">
            <div className="container-wrapper 3xl:fixed:px-0">
                <div className="flex h-(--header-height) items-center gap-2 **:data-[slot=separator]:!h-4">
                    <h1 className="text-base font-medium flex items-center gap-2">
                        <svg id="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 75.74" width={60} className="fill-current">
                            <path d="M240.93,5.47h-56.16c-4.77,0-8.64,3.87-8.64,8.64v56.16h17.28v-35.28l35.21,35.21,12.22-12.22-35.23-35.23h35.32V5.47Z"/>
                            <path d="M66.62,43.99L29.21,5.56h0s0,0,0,0h-11.35c-3.75,0-6.79,3.04-6.79,6.79v57.83h18.14V31.76l37.4,38.25h0v.17h11.35c3.75,0,6.79-3.04,6.79-6.79V5.56h-18.14v38.43Z"/>
                            <path d="M120.67,5.47h-15.12c-4.77,0-8.64,3.87-8.64,8.64v8.64h23.76v47.52h17.28V22.75h26.16V5.47h-43.44Z"/>
                        </svg>
                        <span role="presentation">•</span>
                        Estimation
                    </h1>
                    <div className="ml-auto flex gap-2 items-center">
                        {children}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header