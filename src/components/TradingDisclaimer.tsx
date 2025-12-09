import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from './LegalWrapper';

export default function TradingDisclaimer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to App
        </button>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold">Risk Disclaimer</h1>
          </div>
          <p className="text-slate-400 mb-8">Last Updated: November 25, 2025</p>

          <div className="space-y-6 text-slate-300">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-yellow-500 mb-3">IMPORTANT NOTICE</h3>
              <p className="text-white">
                Trading stocks, futures, forex, and other financial instruments involves substantial risk of loss and
                is not suitable for every investor. The valuation of financial instruments may fluctuate, and you may
                lose more than your original investment.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. No Financial Advice</h2>
              <p className="mb-2">
                Valeris is a trading journal and analytics platform. We are <strong>NOT</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Registered investment advisors</li>
                <li>Financial planners or advisors</li>
                <li>Brokers or dealers</li>
                <li>Tax professionals or accountants</li>
              </ul>
              <p className="mt-3">
                Nothing on this platform constitutes financial, investment, trading, tax, or legal advice. All content,
                tools, and features are provided for <strong>informational and educational purposes only</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Risk of Loss</h2>
              <p className="mb-2">
                Trading and investing in financial markets carries significant risks:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You can lose some or all of your invested capital</li>
                <li>Past performance does not guarantee future results</li>
                <li>Leverage can amplify both gains and losses</li>
                <li>Market conditions can change rapidly and unpredictably</li>
                <li>Technical analysis and indicators are not foolproof</li>
                <li>Simulated or paper trading results may not reflect real trading performance</li>
              </ul>
              <p className="mt-3">
                <strong>Only risk capital you can afford to lose.</strong> Never trade with money needed for essential
                expenses such as housing, food, or medical care.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Educational Content</h2>
              <p>
                Video courses, articles, tutorials, and other educational materials provided through the Service are
                for general educational purposes only. They represent the personal opinions and experiences of the
                instructors and do not constitute recommendations to buy, sell, or hold any specific securities or
                instruments.
              </p>
              <p className="mt-3">
                Different trading strategies work differently for different people based on risk tolerance, experience,
                capital, and market conditions. What works for one trader may not work for another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. AI Features and Automated Analysis</h2>
              <p className="mb-2">
                Our AI-powered features (including the AI Trading Coach, pattern recognition, and automated analytics):
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Are experimental and may contain errors or inaccuracies</li>
                <li>Should not be relied upon as the sole basis for trading decisions</li>
                <li>May not account for all market factors or conditions</li>
                <li>Are not guarantees of future performance or outcomes</li>
                <li>Should be used as supplementary tools, not primary decision-makers</li>
              </ul>
              <p className="mt-3">
                Always conduct your own research and analysis before making trading decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Paper Trading and Simulations</h2>
              <p>
                Paper trading, backtesting, and trade simulation features use historical or delayed data and do not
                reflect real-world trading conditions. Results from simulated trading:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Do not reflect the impact of slippage, commissions, and fees</li>
                <li>May not account for liquidity constraints or order execution delays</li>
                <li>Do not include the psychological pressures of risking real capital</li>
                <li>Are prepared with the benefit of hindsight</li>
                <li>May significantly differ from actual trading results</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Market Data and Third-Party Information</h2>
              <p>
                Market data, news, and information from third-party sources may be delayed, inaccurate, or incomplete.
                We make no warranties about the accuracy, completeness, or timeliness of any market data or information
                provided through the Service.
              </p>
              <p className="mt-3">
                Always verify critical information through multiple independent sources before making trading decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. No Performance Guarantees</h2>
              <p>
                We make no guarantees or promises regarding:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Trading profits or success rates</li>
                <li>Passing funded account evaluations (TopStep, Apex, etc.)</li>
                <li>Achieving consistent profitability</li>
                <li>Specific financial outcomes or results</li>
                <li>Your ability to become a professional trader</li>
              </ul>
              <p className="mt-3">
                Success in trading depends on numerous factors including skill, discipline, risk management, market
                conditions, and capital availability, most of which are beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Community and User-Generated Content</h2>
              <p>
                Content posted in forums, chat rooms, or other community features represents the personal opinions of
                individual users. Such content:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Is not verified or endorsed by Valeris</li>
                <li>Should not be considered financial advice</li>
                <li>May be inaccurate, misleading, or outdated</li>
                <li>Reflects personal experiences that may not apply to you</li>
              </ul>
              <p className="mt-3">
                Never make investment decisions based solely on advice or opinions from other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Regulatory Considerations</h2>
              <p>
                You are responsible for understanding and complying with all applicable laws, regulations, and tax
                obligations related to trading and investing in your jurisdiction. Regulations vary by country and
                region. Consult with qualified legal and tax professionals regarding your specific situation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Professional Advice Recommended</h2>
              <p className="mb-2">
                Before making any financial decisions, we strongly recommend consulting with:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>A licensed financial advisor or investment professional</li>
                <li>A qualified tax professional regarding tax implications</li>
                <li>A legal professional for regulatory compliance matters</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">11. No Liability</h2>
              <p>
                Valeris, its owners, employees, and affiliates are not liable for any losses, damages, or
                adverse outcomes resulting from:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Your use of the Service or reliance on any information provided</li>
                <li>Trading decisions made based on tools, features, or content</li>
                <li>Errors, delays, or inaccuracies in data or information</li>
                <li>Service interruptions or technical issues</li>
                <li>Third-party content or recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">12. Your Responsibility</h2>
              <p>
                By using Valeris, you acknowledge and accept that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You are solely responsible for your trading and investment decisions</li>
                <li>You understand the substantial risks involved in trading</li>
                <li>You have the knowledge and experience to evaluate the risks</li>
                <li>You will conduct your own due diligence and research</li>
                <li>You will not hold us liable for your trading outcomes</li>
              </ul>
            </section>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mt-8">
              <h3 className="text-xl font-bold text-red-500 mb-3">FINAL WARNING</h3>
              <p className="text-white">
                If you do not understand these risks, or if you are not prepared to accept potential losses, you should
                not engage in trading or use this Service for making trading decisions. When in doubt, seek professional
                advice from qualified financial professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
