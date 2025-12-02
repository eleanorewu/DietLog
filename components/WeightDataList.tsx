import React, { useState } from 'react';
import { WeightRecord } from '../types';
import { LogOut, Trash2 } from 'lucide-react';
import { Dialog } from './Dialog';
import { useTheme } from '../contexts/ThemeContext';

interface WeightDataListProps {
  weightRecords: WeightRecord[];
  onBack: () => void;
  onDeleteWeightRecord: (recordId: string) => void;
}

export const WeightDataList: React.FC<WeightDataListProps> = ({
  weightRecords,
  onBack,
  onDeleteWeightRecord
}) => {
  const { theme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const handleDeleteClick = (recordId: string) => {
    // 防呆：如果只剩一筆記錄，不允許刪除
    if (weightRecords.length === 1) {
      return;
    }
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDeleteWeightRecord(recordToDelete);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="flex flex-col p-2 h-full bg-slate-50 dark:bg-gray-900 animate-slideIn transition-colors duration-200">
      {/* Header */}
        <div className="flex items-center p-4">
            <button 
        onClick={onBack} 
        className="p-2 -ml-2 text-slate-600 dark:text-gray-300 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
        <LogOut className="rotate-180" size={24}/>
            </button>
            <h1 className="text-xl font-bold ml-2 text-slate-900 dark:text-gray-100">體重</h1>
        </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {weightRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-gray-500">
            <p>尚無體重記錄</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weightRecords
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(record => (
                <div 
                  key={record.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-slate-100 dark:border-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-base font-bold text-slate-900 dark:text-gray-100">
                          {record.weight.toFixed(1)}
                        </span>
                        <span className="text-base font-medium text-slate-600 dark:text-gray-300">kg</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-gray-400">
                        {record.date}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(record.id)}
                      disabled={weightRecords.length === 1}
                      className={`p-3 rounded-lg transition-colors ${
                        weightRecords.length === 1
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer'
                      }`}
                      title={weightRecords.length === 1 ? '至少需保留一筆體重記錄' : '刪除記錄'}
                    >
                      <Trash2 size={20} className="text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* 刪除確認 Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="刪除體重記錄"
        message="確定要刪除這筆體重記錄嗎？"
        confirmText="確定"
        cancelText="取消"
        isDangerous={true}
      />
    </div>
  );
};
