import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import { TensorTerm } from './MathComponents';
import type { useSimulatorState } from '../hooks/useSimulatorState';

interface SimulatorEquationPanelProps {
  sourceTerms: ReturnType<typeof useSimulatorState>['sourceTerms'];
  sourceTermsExEy: ReturnType<typeof useSimulatorState>['sourceTermsExEy'];
  expandedFormulas: ReturnType<typeof useSimulatorState>['expandedFormulas'];
}

export function SimulatorEquationPanel({
  sourceTerms,
  sourceTermsExEy,
  expandedFormulas,
}: SimulatorEquationPanelProps) {
  const [showEquations, setShowEquations] = useState(false);
  const [verboseFormulas, setVerboseFormulas] = useState(false);

  return (
    <div className="mt-12 border-t border-ink border-opacity-10 pt-8">
      <button
        onClick={() => setShowEquations(!showEquations)}
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mx-auto"
      >
        {showEquations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showEquations ? 'Hide Mathematical Details' : 'Show Mathematical Details'}
      </button>

      {showEquations && (
        <div className="mt-8 bg-white/50 border border-ink p-6 md:p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4">
            <h3 className="text-lg font-serif italic">Mathematical Model</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              The SHG intensity <InlineMath math="I" /> is calculated based on the incident electric field <InlineMath math="\vec{E}_{in}" /> and the resulting source polarization <InlineMath math="\vec{S}" />.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">1. Incident Field</h4>
              <p className="text-sm opacity-70 leading-relaxed">
                The incident light propagates along the Lab Z-axis. The electric field vector is defined by the polarizer angle <InlineMath math="\theta_{pol}" />:
              </p>
              <div className="bg-ink/5 p-4 overflow-x-auto">
                <BlockMath math="\vec{E}_{in} = \begin{pmatrix} E_X \\ E_Y \\ 0 \end{pmatrix} = E_0 \begin{pmatrix} \cos(\theta_{pol}) \\ \sin(\theta_{pol}) \\ 0 \end{pmatrix}" />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">2. Source Terms (Lab Frame)</h4>
              <p className="text-sm opacity-70 leading-relaxed">
                For the selected point group and crystal orientation, the source terms evaluate to:
              </p>
              <div className="bg-ink/5 p-4 overflow-x-auto space-y-6">
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">As functions of <InlineMath math="E_X, E_Y" /></div>
                  {sourceTermsExEy.filter(term => term.component === 'S_X' || term.component === 'S_Y').map((term, i) => (
                    <div key={`exey-${i}`} className="flex items-center gap-4 font-mono text-sm whitespace-nowrap">
                      <div><TensorTerm term={term.component} isNull={term.expression === '0'} /></div>
                      <div>=</div>
                      <div><TensorTerm term={term.expression} isNull={term.expression === '0'} /></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 pt-4 border-t border-ink/10">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">As functions of <InlineMath math="\theta_{pol}" /></div>
                  {sourceTerms.filter(term => term.component === 'S_X' || term.component === 'S_Y').map((term, i) => (
                    <div key={`theta-${i}`} className="flex items-center gap-4 font-mono text-sm whitespace-nowrap">
                      <div><TensorTerm term={`${term.component}(\\theta_{pol})`} isNull={term.expression === '0'} /></div>
                      <div>=</div>
                      <div><TensorTerm term={term.expression} isNull={term.expression === '0'} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">3. Detected Intensity Formulas</h4>
                <button
                  onClick={() => setVerboseFormulas(!verboseFormulas)}
                  className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  {verboseFormulas ? 'Show Short' : 'Show Expanded'}
                </button>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">
                The plotted intensities <InlineMath math="I \propto |E_{out}|^2" /> correspond to the following configurations, where <InlineMath math="\theta" /> is the angle shown on the polar plot:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-ink/5 p-4 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50">Anisotropy</div>
                  <div className="space-y-2">
                    <div className="text-xs opacity-70">Parallel (<InlineMath math="\theta_{pol} = \theta_{ana} = \theta" />):</div>
                    <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.aniPar : "I_{\\parallel} = |S_X(\\theta) \\cos\\theta + S_Y(\\theta) \\sin\\theta|^2"} /></div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs opacity-70">Crossed (<InlineMath math="\theta_{pol} = \theta, \theta_{ana} = \theta + 90^\circ" />):</div>
                    <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.aniPerp : "I_{\\perp} = |-S_X(\\theta) \\sin\\theta + S_Y(\\theta) \\cos\\theta|^2"} /></div>
                  </div>
                </div>

                <div className="bg-ink/5 p-4 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50">Polarizer</div>
                  <div className="space-y-2">
                    <div className="text-xs opacity-70">Analyzer 0° (<InlineMath math="\theta_{ana} = 0^\circ, \theta_{pol} = \theta" />):</div>
                    <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.polA0 : "I = |S_X(\\theta)|^2"} /></div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs opacity-70">Analyzer 90° (<InlineMath math="\theta_{ana} = 90^\circ, \theta_{pol} = \theta" />):</div>
                    <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.polA90 : "I = |S_Y(\\theta)|^2"} /></div>
                  </div>
                </div>

                <div className="bg-ink/5 p-4 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50">Analyzer</div>
                  <div className="space-y-2">
                    <div className="text-xs opacity-70">Polarizer 0° (<InlineMath math="\theta_{pol} = 0^\circ, \theta_{ana} = \theta" />):</div>
                    <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.anaP0 : "I = |S_X(0^\\circ) \\cos\\theta + S_Y(0^\\circ) \\sin\\theta|^2"} /></div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs opacity-70">Polarizer 90° (<InlineMath math="\theta_{pol} = 90^\circ, \theta_{ana} = \theta" />):</div>
                    <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.anaP90 : "I = |S_X(90^\\circ) \\cos\\theta + S_Y(90^\\circ) \\sin\\theta|^2"} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
