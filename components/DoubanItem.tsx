// components/DoubanItem.tsx

type DoubanItemProps = {
  title: string
  url: string
  imageUrl: string
  rating: string | number
  abstract: string
  markedDate?: string
}

export const DoubanItem: React.FC<DoubanItemProps> = ({
  title,
  url,
  imageUrl,
  rating,
  abstract,
  markedDate,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      padding: '1rem',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
    }}
  >
    <div style={{ marginRight: '1rem', flexShrink: 0 }}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={imageUrl}
          alt={`封面：${title}`}
          style={{ width: '100px', height: 'auto', borderRadius: '4px', display: 'block' }}
        />
      </a>
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: '#1a0dab' }}
        >
          {title}
        </a>
      </h3>
      <div style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#db6f00' }}>
        <strong>⭐ {rating}</strong>
      </div>
      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
        {abstract}
      </p>
      {markedDate && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Marked {markedDate}</p>
      )}
    </div>
  </div>
)
