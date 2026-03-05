import PriceLineChart from './LineChart'
import './App.css'

export default function App() {
  return (
    <div className="panel">
      <h1 className="panel-title">Precio diario del gas y del petróleo</h1>
      <p className="panel-subtitle">Datos actualizados el {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div className="charts-row">
        <PriceLineChart
          csvUrl="https://raw.githubusercontent.com/Newtral-datos/panel-precio-gas-petroleo/main/Gas/gas_total.csv"
          title="Precio diario del gas en España"
          dateKey="Fecha"
          valueKey="Precio_EUR_MWh"
          unit="EUR/MWh"
          color="#01f3b3"
          sourceLabel="Fuente: Mercado Ibérico del Gas (MIGBGAS)"
          sourceUrl="https://www.mibgas.es/"
          yMax={250}
        />
        <PriceLineChart
          csvUrl="https://raw.githubusercontent.com/Newtral-datos/panel-precio-gas-petroleo/main/Petr%C3%B3leo/petroleo.csv"
          title="Precio diario del petróleo por barril de crudo Brent"
          dateKey="fecha"
          valueKey="precio"
          unit="USD/barril"
          color="#01f3b3"
          sourceLabel="Fuente: Investing"
          sourceUrl="https://es.investing.com/commodities/brent-oil-historical-data"
        />
      </div>
    </div>
  )
}
