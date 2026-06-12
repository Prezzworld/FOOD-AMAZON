import React from "react";
import { FiRefreshCcw } from "react-icons/fi";
import { GoTriangleRight } from "react-icons/go";

const FILTER_MENU = ["Date", "Rating", "Product", "Status"];

const FilterDropdown = ({
  activeFilters,
  onFilterClick,
  onReset,
  onClose,
  activeSubFilter,
}) => {
  const FILTER_KEY_MAP = {
    Date: "days",
    Rating: "rating",
    Product: "productId",
    Status: "status",
  };

  return (
		<div className="filter-dropdown-card position-absolute bg-white shadow rounded">
			<div className="filter-dropdown-header d-flex align-items-center justify-content-between px-4 pt-4 pb-2">
				<p
					className="font-archivo fw-semibold mb-0"
					style={{ color: "#282a36" }}
				>
					Filter by
				</p>
				<button
					onClick={onReset}
					className="bg-transparent border-0 cursor-pointer"
					title="Reset all filters"
				>
					<FiRefreshCcw size={15} color="#282a36" />
				</button>
			</div>
			<hr className="my-0" />
			<div className="filter-dropdown-body py-4 px-3">
				{FILTER_MENU.map((menu) => {
					const key = FILTER_KEY_MAP[menu];
					const hasActiveFilter = activeFilters[key] !== undefined;
					return (
						<button
							key={menu}
							onClick={() => onFilterClick(menu)}
							className={`filter-menu-item w-100 d-flex align-items-center justify-content-between bg-transparent mb-3 rounded ${activeSubFilter === menu ? "filter-menu-item--active" : ""}`}
						>
							<div className="d-flex align-items-center gap-2">
								<input type="checkbox" className="filter-active-dot" checked={activeSubFilter === menu}/>
								<span
									className="font-archivo fs-sm"
									style={{ color: "#282a36" }}
								>
									{menu}
								</span>
							</div>
						</button>
					);
				})}
			</div>
			<div className="filter-dropdown-footer d-flex gap-2 px-4 py-3">
				<button
					onClick={onClose}
					className="filter-footer-btn w-50 filter-btn-apply font-archivo fs-sm fw-medium bg-primary-normal border-0 rounded py-2 text-white"
				>
					Apply
				</button>
				<button
					onClick={onClose}
					className="filter-footer-btn w-50 filter-btn-cancel font-archivo fs-sm fw-medium bg-transparent rounded py-2"
				>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default FilterDropdown;