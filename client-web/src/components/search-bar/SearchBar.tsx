import AutoComplete, {
  AutocompleteRenderInputParams,
  AutocompleteRenderGetTagProps,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { usePhotoStore, FilterOptionValue } from "../../stores/photo-store";
import { useMedia } from "../../hooks/use-media";
import { STYLING_CONFIG } from "../../config";
import "./styles.css";

const SearchBarTextField = (
  params: AutocompleteRenderInputParams,
  isMobile: boolean
) => {
  return (
    <TextField
      {...params}
      variant="standard"
      size="medium"
      placeholder="Filter Your Photos By Location/Content"
      className="autocomplete-input"
      InputProps={{
        ...params.InputProps,
        style: {
          fontSize: isMobile
            ? STYLING_CONFIG.MOBILE_SEARCH_BAR_FONT_SIZE
            : STYLING_CONFIG.WEB_SEARCH_BAR_FONT_SIZE,
        },
      }}
    />
  );
};

const SearchBarTags = (
  value: FilterOptionValue[],
  getTagProps: AutocompleteRenderGetTagProps,
  isMobile: boolean
) => {
  return value.map((option, index) => (
    <Chip
      {...getTagProps({ index })}
      label={option.label}
      variant="filled"
      size={
        isMobile
          ? STYLING_CONFIG.MOBILE_SEARCH_BAR_CHIP_SIZE
          : STYLING_CONFIG.WEB_SEARCH_BAR_CHIP_SIZE
      }
      className="autocomplete-chip"
    />
  ));
};

const SearchBar = () => {
  const {
    getPhotoFilterOptions,
    selectedPhotoFilters,
    setSelectedPhotoFilters,
  } = usePhotoStore();
  const { isMobile } = useMedia();

  const handleValueChange = (event: any, value: any): void => {
    setSelectedPhotoFilters(value);
  };
  return (
    <div
      className={
        isMobile
          ? "autocomplete-container-mobile"
          : "autocomplete-container-web"
      }
    >
      <AutoComplete
        disableCloseOnSelect
        multiple
        freeSolo
        limitTags={5}
        options={getPhotoFilterOptions()}
        groupBy={(option) => option.type}
        value={selectedPhotoFilters}
        onChange={handleValueChange}
        renderInput={(params) => SearchBarTextField(params, isMobile)}
        renderTags={(value, getTagProps) =>
          SearchBarTags(value, getTagProps, isMobile)
        }
        ListboxProps={{
          style: {
            maxHeight: isMobile
              ? STYLING_CONFIG.MOBILE_SEARCH_BAR_MAX_HEIGHT
              : STYLING_CONFIG.WEB_SEARCH_BAR_MAX_HEIGHT,
            overflowY: "hidden",
            fontSize: isMobile
              ? STYLING_CONFIG.MOBILE_SEARCH_BAR_FONT_SIZE
              : STYLING_CONFIG.WEB_SEARCH_BAR_FONT_SIZE,
          },
        }}
      />
    </div>
  );
};

export default SearchBar;
