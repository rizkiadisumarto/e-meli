import './StatCard.css';

const StatCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  return (
    <div className={`glass-card stat-card border-${color}`}>
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className={`stat-icon bg-${color}-light text-${color}`}>
          {icon}
        </div>
      </div>
      
      <div className="stat-value">{value}</div>
      
      {trend && (
        <div className={`stat-trend ${trend === 'up' ? 'text-primary' : trend === 'down' ? 'text-danger' : 'text-muted'}`}>
          <span className="trend-icon">{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'}</span>
          <span>{trendValue} vs bulan lalu</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
