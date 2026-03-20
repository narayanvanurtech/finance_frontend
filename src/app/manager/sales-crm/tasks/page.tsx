"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTasksStore } from "@/stores/salesCrmStore/useTasksStore";
import { Task, CreateTaskPayload, UpdateTaskPayload } from "@/api/taskApi";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";
import Pagination from "@/components/sales-crm/Pagination";
import { pageLimit } from "@/utils/data";
import {
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CompletedIcon,
  Pending as WaitingIcon,
  PlayCircle as InProgressIcon,
  Schedule as DeferredIcon,
  RadioButtonUnchecked as NotStartedIcon,
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckBoxOutlineBlank as SelectIcon,
  CheckBox,
  FilterList as FilterIcon,
  BarChart as StatsIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useSelectedItemsStore } from "@/stores/salesCrmStore/useSelectedItemsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

const STAGES = [
  {
    id: "open",
    name: "Open",
    color: "bg-amber-200 text-amber-800",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: <NotStartedIcon className="h-4 w-4 text-amber-700" />,
  },
  {
    id: "progress",
    name: "In Progress",
    color: "bg-blue-200 text-blue-900",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: <InProgressIcon className="h-4 w-4 text-blue-700" />,
  },
  {
    id: "done",
    name: "Done",
    color: "bg-green-200 text-green-900",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: <CompletedIcon className="h-4 w-4 text-green-700" />,
  },
  {
    id: "cancel",
    name: "Cancelled",
    color: "bg-red-200 text-red-900",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: <DeferredIcon className="h-4 w-4 text-red-700" />,
  },
];

type DropPosition = "top" | "middle" | "bottom" | null;

const TasksPipeline = () => {
  const router = useRouter();
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    updateTask,
    deleteTask,
    bulkDeleteTasks,
    totalTasks,
    totalPages,
  } = useTasksStore();
  const { selectedItems, setSelectedItems, clearSelectedItems } =
    useSelectedItemsStore();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    taskId: string;
    subject: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = pageLimit;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchTasks(user.companyId, {
        page: currentPage,
        limit: itemsPerPage
      });
    }
  }, [fetchTasks, currentPage, itemsPerPage, user?.companyId]);


  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesFilter =
      !activeFilter ||
      (activeFilter === "high_priority" && task.priority === "high") ||
      (activeFilter === "due_soon" &&
        task.createdAt && new Date(task.createdAt).getTime() - Date.now() <
          3 * 24 * 60 * 60 * 1000) ||
      (activeFilter === "my_tasks" &&
        task.taskOwner?.email === "connect@learnlyst.com");

    return matchesSearch && matchesFilter;
  });

  const tasksByStage = STAGES.reduce((acc, stage) => {
    // Filter tasks that match the exact status for this stage
    acc[stage.id] = filteredTasks.filter((task: Task) => {
      return task.status === stage.id;
    });
    return acc;
  }, {} as Record<string, Task[]>);

  const calculateStageMetrics = (stageId: string) => {
    const stageTasks = tasksByStage[stageId] || [];
    const overdueCount = stageTasks.filter(
      (task) => task.createdAt && new Date(task.createdAt).getTime() < Date.now()
    ).length;

    return { count: stageTasks.length, overdueCount };
  };

  const handleDragStart = (task: Task, e: React.DragEvent) => {
    setDraggedTask(task);
    setIsDragging(true);

    const dragImage = document.createElement("div");
    dragImage.className =
      "w-48 bg-white shadow-xl rounded-lg p-3 border border-gray-200 opacity-90";
    dragImage.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-medium text-sm truncate">${task.title}</h3>
        <span class="text-xs px-2 py-1 rounded-full ${
          task.priority === "high"
            ? "bg-red-100 text-red-800"
            : task.priority === "medium"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
        }">
          ${task.priority}
        </span>
      </div>
      <p class="text-xs text-gray-500 mb-2 truncate">${
        task.description || ""
      }...</p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Created: ${formatDate(
          task.createdAt || new Date().toISOString()
        )}</span>
        <span class="text-xs text-gray-500">Updated: ${formatDate(
          task.updatedAt || new Date().toISOString()
        )}</span>
      </div>
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (
    e: React.DragEvent,
    stageId: string,
    index?: number
  ) => {
    e.preventDefault();
    setDragOverStage(stageId);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDropPosition("top");
      setTargetIndex(index !== undefined ? index : 0);
    } else if (y > height * 0.75) {
      setDropPosition("bottom");
      setTargetIndex(
        index !== undefined ? index + 1 : tasksByStage[stageId].length
      );
    } else {
      setDropPosition("middle");
      setTargetIndex(
        index !== undefined
          ? index
          : Math.floor(tasksByStage[stageId].length / 2)
      );
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
    setDropPosition(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();

    if (!draggedTask) {
      resetDragState();
      return;
    }

    try {
      // Create a task update object with the new status
      const taskUpdate: UpdateTaskPayload = {
        title: draggedTask.title,
        description: draggedTask.description,
        priority: draggedTask.priority,
        status: targetStageId as 'open' | 'progress' | 'done' | 'cancel'
      };
      
      // Call updateTask with the task ID and update data
      await updateTask(draggedTask.id, taskUpdate);
      
      // Refresh task list after update
      if (user?.companyId) {
        await fetchTasks(user.companyId);
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      resetDragState();
    }
  };

  const resetDragState = () => {
    setDraggedTask(null);
    setDragOverStage(null);
    setDropPosition(null);
    setTargetIndex(null);
    setIsDragging(false);
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTasks((prev) => {
      const isSelected = prev.includes(task.id);
      if (isSelected) {
        setSelectedItems(prev.filter((id) => id !== task.id));
        return prev.filter((id) => id !== task.id);
      } else {
        setSelectedItems([...prev, task.id]);
        return [...prev, task.id];
      }
    });
  };

  const handleMassDelete = async () => {
    if (selectedTasks.length === 0) return;

    setShowDeleteModal(true);
    setTaskToDelete({
      taskId: "multiple",
      subject: `${selectedTasks.length} tasks`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    setDeleteError(null); // Clear any previous errors
    try {
      if (taskToDelete.taskId === "multiple") {
        await bulkDeleteTasks(selectedTasks);
        setSuccessMessage({
          title: "Success",
          message: `Successfully deleted ${selectedTasks.length} tasks`,
        });
        setSelectedTasks([]);
        clearSelectedItems();
      } else {
        await deleteTask(taskToDelete.taskId);
        setSuccessMessage({
          title: "Success",
          message: "Task deleted successfully",
        });
      }
      if (user?.companyId) {
        await fetchTasks(user.companyId);
      }
      setShowDeleteModal(false);
      setTaskToDelete(null);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Delete error:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete task. Please try again."
      );
      // Don't close the modal on error so user can see the error and retry
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
    setDeleteError(null); // Clear any errors when canceling
  };

  const handleTaskEdit = (task: Task) => {
    router.push(`/sales-crm/tasks/${task.id}`);
  };

  const handleTaskDelete = (task: Task) => {
    console.log('Attempting to delete task:', task.id, task.title);
    setTaskToDelete({ taskId: task.id, subject: task.title });
    setShowDeleteModal(true);
  };

  interface TaskCardMenuProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onView: (task: Task) => void;
    onSelect: (task: Task) => void;
  }

  const TaskCardMenu: React.FC<TaskCardMenuProps> = ({
    task,
    onEdit,
    onDelete,
    onView,
    onSelect,
  }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const isSelected = selectedTasks.includes(task.id);
    console.log(
      "Selected:",
      isSelected,
      "TaskId:",
      task.id,
      "Selected Tasks:",
      selectedTasks
    );

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (action: (task: Task) => void) => {
      action(task);
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
              <CheckBox fontSize="small" sx={{ color: "#3b82f6" }} />
            ) : (
              <SelectIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "task-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <MoreIcon />
          </IconButton>
        </div>
        <Menu
          id="task-menu"
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={() => {
              if (user?.companyId) {
                fetchTasks(user.companyId);
              }
            }}
            className="text-blue-500 hover:text-blue-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* Pipeline Board */}
      <div className="flex-1 overflow-hidden mt-3 px-6 pb-2">
        <div
          ref={containerRef}
          className="flex space-x-4 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {STAGES.map((stage) => {
            const stageTasks = tasksByStage[stage.id] || [];
            const { count, overdueCount } = calculateStageMetrics(stage.id);
            const isExpanded =
              expandedStage === stage.id || expandedStage === null;

            return (
              <motion.div
                key={stage.id}
                layout
                className={`flex-shrink-0 w-90 flex flex-col ${stage.bgColor} rounded-xl shadow-sm`}
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
                        {count}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* {overdueCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {overdueCount} overdue
                        </span>
                      )} */}
                      {expandedStage !== null &&
                        (isExpanded ? (
                          <ArrowUpIcon className="text-gray-500" />
                        ) : (
                          <ArrowDownIcon className="text-gray-500" />
                        ))}
                    </div>
                  </div>
                </div>

                {/* Stage Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 flex flex-col space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)]"
                    >
                      {stageTasks.map((task, index) => (
                        <div
                          key={task.id}
                          className={`bg-white rounded-lg shadow-sm border ${
                            draggedTask?.id === task.id
                              ? "opacity-50"
                              : "opacity-100"
                          } ${
                            dragOverStage === stage.id &&
                            dropPosition === "top" &&
                            targetIndex === index
                              ? "border-t-2 border-blue-500"
                              : dragOverStage === stage.id &&
                                dropPosition === "bottom" &&
                                targetIndex === index + 1
                              ? "border-b-2 border-blue-500"
                              : dragOverStage === stage.id &&
                                dropPosition === "middle" &&
                                targetIndex === index
                              ? "border-2 border-blue-500"
                              : "border-gray-100"
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(task, e)}
                          onDragOver={(e) => handleDragOver(e, stage.id, index)}
                          onClick={() => router.push(`/sales-crm/tasks/${task.id}`)}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-sm truncate flex-grow">
                                {task.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    task.priority === "high"
                                      ? "bg-red-100 text-red-800"
                                      : task.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                <TaskCardMenu
                                  task={task}
                                  onEdit={handleTaskEdit}
                                  onDelete={handleTaskDelete}
                                  onView={() =>
                                    router.push(`/sales-crm/tasks/${task.id}`)
                                  }
                                  onSelect={handleTaskSelect}
                                />
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2 text-gray-500">
                                <p className="text-xs truncate">
                                  {task.description || "No description"}
                                </p>
                              </div>

                              <div className="flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center space-x-2">
                                  <CalendarIcon
                                    fontSize="small"
                                    className=" text-gray-400"
                                  />
                                  <span className="text-xs text-gray-500">
                                    Created: {formatDate(task.createdAt || new Date().toISOString())}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                                  <div className="flex items-center space-x-1">
                                    <PeopleIcon className="h-4 w-4" />
                                    <span>{task.taskOwner?.name || 'Unassigned'}</span>
                                  </div>
                                </div>
                              </div>

                            

                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-400">
                                  Updated: {formatDate(task.updatedAt || new Date().toISOString())}
                                </span>
                                <div className="flex items-center">
                                  {task.createdAt && new Date(task.createdAt).getTime() <
                                    Date.now() - (7 * 24 * 60 * 60 * 1000) && (
                                    <span className="text-xs text-amber-600 mr-2">
                                      Old Task
                                    </span>
                                  )}
                                  {stage.icon}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Task Menu */}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
       
      </div>
       {/* Pagination */}
        <div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages || Math.ceil(totalTasks / itemsPerPage)}
            onPageChange={handlePageChange}
            className="py-2"
          />
        </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        show={showDeleteModal}
        title="Delete Task"
        message={
          <>
            {deleteError ? (
              <div className="text-red-600 mb-4">{deleteError}</div>
            ) : (
              <>
                Are you sure you want to delete <br />
                <span className="font-medium">"{taskToDelete?.subject}"</span>?
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

      <ConfirmationDialog
        show={showSuccessDialog}
        title={successMessage.title}
        message={successMessage.message}
        onConfirm={() => setShowSuccessDialog(false)}
        onCancel={() => setShowSuccessDialog(false)}
        confirmText="OK"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default TasksPipeline;
