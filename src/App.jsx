import FlourishChart from './FlourishChart'
import './App.css'

export default function App() {
  return (
    <div className="panel">
      <h1 className="panel-title">Precio diario del gas y del petróleo</h1>
      <div className="charts-row">
        <div className="chart-wrapper">
          <FlourishChart id="27908564" />
        </div>
        <div className="chart-wrapper">
          <FlourishChart id="27908600" />
        </div>
      </div>
    </div>
  )
}
