import AutoComplete, {
  AutocompleteRenderInputParams,
  AutocompleteRenderGetTagProps,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { usePhotoStore, FilterOptionValue } from "../../stores/photo-store";
import { useMedia } from "../../hooks/use-media";
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
        style: { fontSize: isMobile ? 15 : 25 },
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
      size={isMobile ? "small" : "medium"}
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
            maxHeight: isMobile ? "20rem" : "40rem",
            overflowY: "hidden",
            fontSize: isMobile ? 15 : 25,
          },
        }}
      />
    </div>
  );
};

export default SearchBar;
