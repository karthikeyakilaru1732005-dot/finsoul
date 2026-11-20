import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ALL_CALCULATORS } from '../lib/calculations';
import { BOARDROOM_CASES } from '../lib/boardroom-data';
import { useStore } from '../store/useStore';

const featured = [
  { id: 'npv', name: 'Net present value', detail: 'Investment analysis' },
  { id: 'emi', name: 'Loan amortization', detail: 'Loans and financing' },
  { id: 'wacc', name: 'Cost of capital', detail: 'Corporate finance' },
];

export const Home: React.FC = () => {
  const hero = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { streak, level, xp } = useStore();
  const [annualRate, setAnnualRate] = useState(8);
  const [preview, setPreview] = useState<'growth' | 'npv'>('growth');
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const panelY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 68]);
  const futureValue = Math.round(100000 * Math.pow(1 + annualRate / 100, 5));

  return (
    <div className="home-page">
      <section ref={hero} className="home-hero">
        <div className="home-hero-grid">
          <motion.div
            className="home-intro"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow"><span className="eyebrow-rule" />FINSOUL</p>
            <h1>Master finance.<br /><em>Find your edge.</em></h1>
            <p className="home-lede">A sharper way to calculate, compete, and make decisions with confidence.</p>
            <div className="home-actions">
              <Link className="button-primary" to="/toolkit">Explore the toolkit</Link>
              <Link className="button-text" to="/arena">Enter the Arena </Link>
            </div>
            <div className="home-proof">
              <span>{ALL_CALCULATORS.length} financial tools</span>
              <span>{BOARDROOM_CASES.length} business cases</span>
            </div>
          </motion.div>

          <motion.div
            className="product-preview-wrap"
            style={{ y: panelY }}
            initial={reduceMotion ? false : { opacity: 0, x: 20, rotate: 1.5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="product-preview">
              <div className="preview-topline">
                <span>FINSOUL / TOOLKIT</span>
                <span>01 — 26</span>
              </div>
              <div className="preview-heading">
                <p className="preview-kicker">Time value of money</p>
                <h2>{preview === 'growth' ? 'Future value' : 'Investment decision'}</h2>
              </div>
              <div className="preview-tabs" role="tablist" aria-label="Preview calculation">
                <button role="tab" aria-selected={preview === 'growth'} className={preview === 'growth' ? 'is-selected' : ''} onClick={() => setPreview('growth')}>Growth</button>
                <button role="tab" aria-selected={preview === 'npv'} className={preview === 'npv' ? 'is-selected' : ''} onClick={() => setPreview('npv')}>NPV</button>
              </div>
              {preview === 'growth' ? (
                <>
                  <div className="preview-value-row">
                    <div><span className="preview-label">Starting principal</span><strong>₹1,00,000</strong></div>
                    <div><span className="preview-label">After five years</span><strong className="orange-value">₹{futureValue.toLocaleString('en-IN')}</strong></div>
                  </div>
                  <div className="preview-slider-row">
                    <label htmlFor="preview-rate">Annual return <strong>{annualRate}%</strong></label>
                    <input id="preview-rate" type="range" min="2" max="18" value={annualRate} onChange={(event) => setAnnualRate(Number(event.target.value))} />
                  </div>
                  <div className="preview-chart" aria-label="Illustrative value growth over five years">
                    <svg viewBox="0 0 460 120" role="img" aria-label="Future value rises over five years">
                      <path d="M0 99H460" className="preview-axis" />
                      <path d="M8 92 C66 88 86 77 134 74 S212 58 258 53 S350 28 452 13" className="preview-line" />
                      <circle cx="452" cy="13" r="4" className="preview-dot" />
                    </svg>
                    <div className="preview-years"><span>Today</span><span>Year 5</span></div>
                  </div>
                  <p className="preview-footnote">FV = PV × (1 + r)<sup>n</sup><span>Illustrative calculation</span></p>
                </>
              ) : (
                <div className="preview-npv">
                  <div className="npv-equation"><span>Initial investment</span><strong>−₹10,00,000</strong></div>
                  <div className="npv-equation"><span>Present value of inflows</span><strong>₹12,75,085</strong></div>
                  <div className="npv-total"><span>Net present value</span><strong>+₹2,75,085</strong></div>
                  <p>A positive NPV clears the required return and creates value.</p>
                  <Link to="/toolkit/npv">Open the NPV calculator </Link>
                </div>
              )}
            </div>
            <div className="preview-index">CALCULATE / 01</div>
          </motion.div>
        </div>
        <div className="hero-bottomline"><span>CALCULATE. COMPETE. ANALYZE.</span><span>SCROLL TO EXPLORE</span></div>
      </section>

      <section className="home-intro-band">
        <div className="section-marker">01 / THE PRACTICE</div>
        <div className="home-intro-copy">
          <h2>Financial fluency,<br /><em>built through doing.</em></h2>
          <p>Move from a formula to a decision. Work through the numbers, test your judgement, and see what the result means in practice.</p>
        </div>
        <div className="home-stats">
          <div><strong>{streak}<small>d</small></strong><span>Current streak</span></div>
          <div><strong>{level}<small> / 7</small></strong><span>{xp} XP earned</span></div>
        </div>
      </section>

      <section className="experience-section">
        <div className="section-heading-row">
          <div><p className="eyebrow"><span className="eyebrow-rule" />Choose your next move</p><h2>Three ways to get<br /><em>finance-ready.</em></h2></div>
          <p className="section-aside">Practical tools for the work that matters.</p>
        </div>
        <div className="experience-list">
          <Link to="/toolkit" className="experience-row">
            <span className="experience-number">01</span><div><h3>Financial Toolkit</h3><p>Model decisions with transparent calculations and step-by-step working.</p></div><span className="experience-meta">{ALL_CALCULATORS.length} tools </span>
          </Link>
          <Link to="/arena" className="experience-row arena-row">
            <span className="experience-number">02</span><div><h3>FINSOUL Arena</h3><p>Sharpen your instinct in timed and topic-based solo challenges.</p></div><span className="experience-meta">12 disciplines </span>
          </Link>
          <Link to="/boardroom" className="experience-row">
            <span className="experience-number">03</span><div><h3>Boardroom</h3><p>Turn financial analysis into a clear executive recommendation.</p></div><span className="experience-meta">{BOARDROOM_CASES.length} cases </span>
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-heading"><div><p className="eyebrow"><span className="eyebrow-rule" />Start with the essentials</p><h2>Popular calculations</h2></div><Link className="button-text" to="/toolkit">View all tools </Link></div>
        <div className="featured-list">
          {featured.map((tool, index) => (
            <Link to={`/toolkit/${tool.id}`} className="featured-tool" key={tool.id}>
              <span className="featured-index">0{index + 1}</span><span className="featured-name">{tool.name}</span><span className="featured-detail">{tool.detail}</span>
            </Link>
          ))}
        </div>
        <div className="boardroom-cta"><div><p className="eyebrow"><span className="eyebrow-rule" />The executive perspective</p><h2>Good analysis ends<br />with a decision.</h2></div><Link className="button-primary" to="/boardroom">Step into the Boardroom</Link></div>
      </section>
    </div>
  );
};
