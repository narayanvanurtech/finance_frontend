"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dealApi, { Deal as ApiDeal } from "@/api/dealsApi";
import { useDealsStore } from "@/stores/salesCrmStore/useDealsStore";
import { useSelectedItemsStore } from "@/stores/salesCrmStore/useSelectedItemsStore";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as SelectIcon,
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

type DropPosition = "top" | "middle" | "bottom" | null;

interface Deal extends Omit<ApiDeal, "_id"> {
  id: string; // Map from _id
  title: string; // Map from dealName
  company: string; // Map from accountName
  value: number; // Map from rawAmount
  stage: string;
  priority: "low" | "medium" | "high";
  lastContact: string;
  owner: string; // Map from dealOwner
}

const STAGES = [
  {
    id: "qualification",
    name: "Qualification",
    color: "bg-purple-100 text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "needs_analysis",
    name: "Needs Analysis",
    color: "bg-blue-100 text-blue-800",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "value_proposition",
    name: "Value Proposition",
    color: "bg-yellow-100 text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    id: "identify_decision_makers",
    name: "Identify Decision Makers",
    color: "bg-indigo-100 text-indigo-800",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    id: "proposal_price_quote",
    name: "Proposal/Price Quote",
    color: "bg-orange-100 text-orange-800",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "negotiation_review",
    name: "Negotiation/Review",
    color: "bg-pink-100 text-pink-800",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    id: "closed_won",
    name: "Closed Won",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "closed_lost",
    name: "Closed Lost",
    color: "bg-red-100 text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

const DealPipeline = () => {
  const router = useRouter();
  const { dealStages, fetchDeals, isLoading: storeLoading } = useDealsStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [valueImpact, setValueImpact] = useState<number | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<{id: string, title: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{title: string, message: string}>({
    title: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedItems, clearSelectedItems } = useSelectedItemsStore();

  useEffect(() => {
    fetchDeals();
  }, []);

  // Convert store data to local deals format whenever dealStages changes
  useEffect(() => {
    console.log('dealStages changed:', dealStages);
    const allDeals: Deal[] = [];
    dealStages.forEach((stageData) => {
      stageData.deals.forEach((apiDeal) => {
        allDeals.push({
          id: apiDeal._id,
          title: apiDeal.dealName,
          company: apiDeal.accountName,
          value: apiDeal.rawAmount,
          stage: stageData.stage
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace("/", "_"),
          probability: apiDeal.probability,
          owner: apiDeal.dealOwner,
          closingDate: apiDeal.closingDate,
          priority: determinePriority(apiDeal.probability),
          lastContact: new Date().toLocaleDateString(),
          // Required by Deal interface
          dealName: apiDeal.dealName,
          accountName: apiDeal.accountName,
          dealOwner: apiDeal.dealOwner,
          amount: apiDeal.amount,
          rawAmount: apiDeal.rawAmount,
          rawDate: apiDeal.rawDate,
          expectedRevenue: apiDeal.expectedRevenue,
          type: apiDeal.type,
          leadSource: apiDeal.leadSource,
        });
      });
    });
    console.log('Setting local deals:', allDeals);
    setDeals(allDeals);
  }, [dealStages]);

  const determinePriority = (
    probability: number
  ): "low" | "medium" | "high" => {
    if (probability >= 70) return "high";
    if (probability >= 40) return "medium";
    return "low";
  };



  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      !activeFilter ||
      (activeFilter === "high_value" && deal.value > 5000000) ||
      (activeFilter === "closing_soon" &&
        new Date(deal.closingDate).getTime() - Date.now() <
          7 * 24 * 60 * 60 * 1000) ||
      (activeFilter === "my_deals" && deal.owner === "Neha Singh");

    return matchesSearch && matchesFilter;
  });

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredDeals.filter((deal) => deal.stage === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  const calculateStageMetrics = (stageId: string) => {
    const stageDeals = dealsByStage[stageId] || [];
    const totalValue = stageDeals.reduce(
      (sum, deal) => sum + deal.rawAmount,
      0
    );
    const avgProbability =
      stageDeals.length > 0
        ? Math.round(
            stageDeals.reduce((sum, deal) => sum + deal.probability, 0) /
              stageDeals.length
          )
        : 0;

    return { totalValue, avgProbability };
  };

  const calculateValueImpact = (sourceStage: string, targetStage: string) => {
    return null;
  };

  const handleDragStart = (deal: Deal, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedDeal(deal);
    setValueImpact(null);
    setIsDragging(true);

    // Set a custom drag image
    const dragImage = document.createElement("div");
    dragImage.className =
      "w-48 bg-white shadow-xl rounded-lg p-3 border border-gray-200 opacity-90";
    dragImage.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-medium text-sm truncate">${deal.title}</h3>
        <span class="text-xs font-medium">${deal.value}</span>
      </div>
      <p class="text-xs text-gray-500 mb-2 truncate">${deal.company}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs px-2 py-1 rounded-full ${
          deal.probability === 100
            ? "bg-green-100 text-green-800"
            : deal.probability === 0
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
        }">
          ${deal.probability}%
        </span>
        <span class="text-xs text-gray-500">${deal.lastContact}</span>
      </div>
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 20);

    // Remove the element after a short delay
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (
    e: React.DragEvent,
    stageId: string,
    index?: number
  ) => {
    e.preventDefault();
    setDragOverStage(stageId);

    if (draggedDeal && stageId !== draggedDeal.stage) {
      const impact = calculateValueImpact(draggedDeal.stage, stageId);
      setValueImpact(impact);
    } else {
      setValueImpact(null);
    }

    if (stageId !== draggedDeal?.stage) {
      setDropPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDropPosition("top");
      setTargetIndex(index !== undefined ? index : 0);
    } else if (y > height * 0.75) {
      setDropPosition("bottom");
      setTargetIndex(
        index !== undefined ? index + 1 : dealsByStage[stageId].length
      );
    } else {
      setDropPosition("middle");
      setTargetIndex(
        index !== undefined
          ? index
          : Math.floor(dealsByStage[stageId].length / 2)
      );
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
    setDropPosition(null);
    setValueImpact(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();

    if (!draggedDeal) {
      return;
    }

    // Find the stage name from STAGES array
    const targetStage = STAGES.find(stage => stage.id === targetStageId);
    if (!targetStage) {
      return;
    }

    try {
      // Only call the API if the stage is actually changing
      if (targetStageId !== draggedDeal.stage) {
        setIsLoading(true);
        await dealApi.updateDealStage(draggedDeal.id, {
          newStage: targetStage.name // Send the stage name, not the ID
        });

        // Refresh the deals list after updating
        await fetchDeals();
      }

      let updatedDeals = [...deals];
      const sourceIndex = updatedDeals.findIndex((d) => d.id === draggedDeal.id);

      if (sourceIndex === -1) {
        return;
      }

      // Remove from original position
      const [movedDeal] = updatedDeals.splice(sourceIndex, 1);

      // Update stage
      movedDeal.stage = targetStageId;

      // Calculate insertion position
      let insertIndex = updatedDeals.length;

      if (targetStageId === draggedDeal.stage && targetIndex !== null) {
        // Moving within the same stage
        insertIndex = targetIndex;
      } else {
        // Moving to a different stage - calculate position based on drop zone
        const stageDeals = updatedDeals.filter((d) => d.stage === targetStageId);
        const stageStartIndex = updatedDeals.findIndex(
          (d) => d.stage === targetStageId
        );
        
        if (dropPosition === "top") {
          insertIndex = stageStartIndex;
        } else if (dropPosition === "bottom") {
          insertIndex = stageStartIndex + stageDeals.length;
        } else {
          // Middle position
          insertIndex = stageStartIndex + Math.floor(stageDeals.length / 2);
        }
      }

      // Insert at calculated position
      updatedDeals.splice(insertIndex, 0, movedDeal);

      setDeals(updatedDeals);
    } catch (error) {
      console.error('Error updating deal stage:', error);
      // Show error to user
      setSuccessMessage({
        title: 'Error',
        message: 'Failed to update deal stage. Please try again.'
      });
      setShowSuccessDialog(true);
    } finally {
      setIsLoading(false);
      resetDragState();
    }
  };

  const resetDragState = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
    setDropPosition(null);
    setTargetIndex(null);
    setValueImpact(null);
    setIsDragging(false);
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  interface DealCardMenuProps {
    deal: Deal;
    onEdit: (deal: Deal) => void;
    onDelete: (deal: Deal) => void;
    onView: (deal: Deal) => void;
    onSelect: (deal: Deal) => void;
  }

  const DealCardMenu: React.FC<DealCardMenuProps> = ({
    deal,
    onEdit,
    onDelete,
    onView,
    onSelect,
  }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const isSelected = selectedDeals.includes(deal.id);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (action: (deal: Deal) => void) => {
      action(deal);
      handleClose();
    };

    return (
      <div onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onSelect);
            }}
            size="small"
            sx={{ mr: 1 }}
          >
            {isSelected ? (
              <CheckBoxIcon fontSize="small" sx={{ color: "#3b82f6" }} />
            ) : (
              <SelectIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "deal-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <MoreIcon />
          </IconButton>
        </div>
        <Menu
          id="deal-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={() => handleAction(onView)}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onEdit)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onDelete)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    );
  };

  const renderDealCard = (deal: Deal, stage: (typeof STAGES)[0]) => {
    return (
      <div
        key={deal.id}
        draggable
        onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
          handleDragStart(deal, e)
        }
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-2 cursor-move transition-all duration-200 group"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm truncate flex-1 mr-2">{deal.title}</h3>
          <div className="flex items-center">
            <DealCardMenu
              deal={deal}
              onEdit={handleDealEdit}
              onDelete={handleDealDelete}
              onView={handleDealView}
              onSelect={handleDealSelect}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <PeopleIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate flex-1">{deal.accountName || "----"}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs px-2 py-1 rounded-full flex items-center bg-blue-100 text-blue-800">
             Probability:  {deal.probability}%
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <MoneyIcon className="h-4 w-4 mr-1 text-green-600" />
              ₹{deal.value.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1 truncate">
              <span className="truncate">
                <span className="text-black">Owner:</span> {deal.owner}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{(deal.closingDate)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDealSelect = (deal: Deal) => {
    setSelectedDeals(prev => {
      const isSelected = prev.includes(deal.id);
      if (isSelected) {
        const newSelection = prev.filter(id => id !== deal.id);
        setSelectedItems(newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, deal.id];
        setSelectedItems(newSelection);
        return newSelection;
      }
    });
  };


  const handleDeleteConfirm = async () => {
    if (!dealToDelete || isDeleting) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      if (dealToDelete.id === 'multiple') {
        await dealApi.bulkDeleteDeals(selectedDeals);
        setSuccessMessage({
          title: 'Success',
          message: `Successfully deleted ${selectedDeals.length} deals`
        });
        setSelectedDeals([]);
        clearSelectedItems();
      } else {
        await dealApi.deleteDeal(dealToDelete.id);
        setSuccessMessage({
          title: 'Success',
          message: `Successfully deleted deal "${dealToDelete.title}"`
        });
      }
      await fetchDeals();
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error deleting deals:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete deals. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDealToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDealToDelete(null);
  };

  const handleDealEdit = (deal: Deal) => {
    router.push(`/deals/${deal.id}`);
  };

  const handleDealView = (deal: Deal) => {
    router.push(`/deals/${deal.id}`);
  };

  const handleDealDelete = (deal: Deal) => {
    setDealToDelete({ id: deal.id, title: deal.title });
    setShowDeleteModal(true);
  };

  if (storeLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Pipeline Board */}
      <div className="flex-1 overflow-hidden mt-3 px-6 pb-6">
        <div
          ref={containerRef}
          className="flex space-x-4 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage.id] || [];
            const { totalValue, avgProbability } = calculateStageMetrics(
              stage.id
            );
            const isExpanded =
              expandedStage === stage.id || expandedStage === null;

            return (
              <motion.div
                key={stage.id}
                layout
                className={`flex-shrink-0 w-80 flex flex-col ${stage.bgColor} rounded-xl shadow-sm`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div
                  className={`p-4 rounded-t-xl border-b ${stage.borderColor} flex flex-col cursor-pointer hover:bg-opacity-70 transition-colors`}
                  onClick={() => toggleStageExpansion(stage.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${stage.color.replace(
                          "bg-",
                          "bg-opacity-70 bg-"
                        )}`}
                      />
                      <h2 className="font-semibold text-gray-800">
                        {stage.name}
                      </h2>
                      <span className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded-full">
                        {stageDeals.length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        {totalValue}
                      </span>
                      {expandedStage !== null &&
                        (isExpanded ? (
                          <ArrowUpIcon className="text-gray-500" />
                        ) : (
                          <ArrowDownIcon className="text-gray-500" />
                        ))}
                    </div>
                  </div>

                  {/* Stage progress bar */}
                  {/* <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stage.color.replace('bg-', 'bg-opacity-70 bg-')}`}
                      style={{ width: `${avgProbability}%` }}
                    />
                  </div> */}

                  {/* Value impact indicator */}
                  {dragOverStage === stage.id &&
                    draggedDeal?.stage !== stage.id &&
                    valueImpact && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`text-xs mt-2 font-medium flex items-center ${
                          valueImpact > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {valueImpact > 0 ? (
                          <span className="inline-flex items-center">
                            <ArrowUpIcon className="h-4 w-4 mr-1" />+
                            {valueImpact}
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            <ArrowDownIcon className="h-4 w-4 mr-1" />
                            {valueImpact}
                          </span>
                        )}
                      </motion.div>
                    )}
                </div>

                {/* Stage Body */}
                <motion.div
                  layout
                  className={`flex-1 rounded-b-xl overflow-y-auto p-2 ${
                    stage.bgColor
                  } ${
                    dragOverStage === stage.id
                      ? "border-2 border-dashed border-blue-400"
                      : ""
                  }`}
                  style={{
                    maxHeight: isExpanded ? "calc(100vh - 300px)" : "60px",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <AnimatePresence>
                    {stageDeals.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`flex flex-col items-center justify-center h-32 text-gray-400 ${
                          dragOverStage === stage.id
                            ? "bg-blue-50 bg-opacity-50 rounded-lg"
                            : ""
                        }`}
                      >
                        <p className="text-sm">No deals in this stage</p>
                        {dragOverStage === stage.id && (
                          <p className="text-xs mt-2 text-blue-500 font-medium">
                            Drop here to move
                          </p>
                        )}
                      </motion.div>
                    )}

                    {isExpanded &&
                      stageDeals.map((deal, index) => (
                        <React.Fragment key={deal.id}>
                          {/* Drop indicator above the card */}
                          {dragOverStage === stage.id &&
                            draggedDeal?.id !== deal.id &&
                            dropPosition === "top" &&
                            targetIndex === index && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 4 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full relative my-1"
                              >
                                <div className="absolute inset-x-0 top-0 flex justify-center">
                                  <div className="h-1 w-full bg-blue-500 rounded-full" />
                                </div>
                              </motion.div>
                            )}

                          {/* Deal card */}
                          {renderDealCard(deal, stage)}

                          {/* Drop indicator below the card */}
                          {dragOverStage === stage.id &&
                            draggedDeal?.id !== deal.id &&
                            dropPosition === "bottom" &&
                            targetIndex === index + 1 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 4 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full relative my-1"
                              >
                                <div className="absolute inset-x-0 top-0 flex justify-center">
                                  <div className="h-1 w-full bg-blue-500 rounded-full" />
                                </div>
                              </motion.div>
                            )}
                        </React.Fragment>
                      ))}

                    {/* Drop indicator at the end of the list */}
                    {isExpanded &&
                      dragOverStage === stage.id &&
                      stageDeals.length > 0 &&
                      dropPosition === "bottom" &&
                      targetIndex === stageDeals.length && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 4 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full relative my-1"
                        >
                          <div className="absolute inset-x-0 top-0 flex justify-center">
                            <div className="h-1 w-8 bg-blue-500 rounded-full" />
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        show={showDeleteModal}
        title={`Delete ${dealToDelete?.id === 'multiple' ? 'Deals' : 'Deal'}`}
        message={
          <>
            {deleteError ? (
              <div className="text-red-600 mb-4">{deleteError}</div>
            ) : (
              <>
                Are you sure you want to delete <br />
                {dealToDelete?.id === 'multiple' 
                  ? `${dealToDelete.title}?`
                  : <span className="font-medium">"{dealToDelete?.title}"</span>}
              </>
            )}
          </>
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        disableConfirm={isDeleting}
        disableCancel={isDeleting}
      />

      {/* Success Dialog */}
      <ConfirmationDialog
        show={showSuccessDialog}
        title={successMessage.title}
        message={successMessage.message}
        onConfirm={() => setShowSuccessDialog(false)}
        onCancel={() => setShowSuccessDialog(false)}
        confirmText="OK"
        type="success"
      />
    </div>
  );
};

export default DealPipeline;
