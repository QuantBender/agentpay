export function Footer() {
  return (
    <footer className="border-t border-gray-700 bg-gray-900/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AP</span>
            </div>
            <span className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
              AgentPay — Autonomous AI Payments with MNEE
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
            <a 
              href="https://mnee.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-300 transition-colors"
            >
              MNEE Stablecoin
            </a>
            <a 
              href="https://etherscan.io/address/0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-300 transition-colors"
            >
              Contract
            </a>
            <span className="hidden sm:inline text-gray-400">Built for MNEE Hackathon 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
