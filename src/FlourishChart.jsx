export default function FlourishChart({ id }) {
  return (
    <iframe
      src={`https://flo.uri.sh/visualisation/${id}/embed`}
      title={`Flourish chart ${id}`}
      frameBorder="0"
      scrolling="no"
      style={{ width: '100%', height: '100%', border: 'none' }}
      allowFullScreen
    />
  )
}
