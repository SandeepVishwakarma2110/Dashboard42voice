// File: src/components/KpiCard.jsx

const KpiCard = ({ title, value, icon: IconComponent, color }) => {
    return (
        <div className="bg-[#2c2b65] p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-105">
            <div className={`p-3 rounded-full ${color}`}>
                <IconComponent size={24} className="text-white" />
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

export default KpiCard;

