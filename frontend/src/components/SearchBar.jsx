import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [debouncedUsername, setDebouncedUsername] = useState("");

  // Debounce the username input
  const handleInputChange = useMemo(
    () =>
      debounce((value) => {
        setDebouncedUsername(value);
      }, 500),
    []
  ); // 500ms delay

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedUsername],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/connections/connection/${debouncedUsername}`
      );
      return response.data;
    },
    enabled: !!debouncedUsername,
  });

  const onChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    handleInputChange(value);
  };

  const handleClick = (username) => {
    navigate(`/profile/${username}`);
  };
  return (
    <div>
      <input
        type="search"
        value={username}
        onChange={onChange}
        placeholder="who are u looking for?"
        className="bg-base-100 w-full p-2 focus:outline-none hover:bg-base-200 focus:bg-base-200 transition-colors duration-200 pl-4"
      />
      <div className="max-h-[152px] overflow-y-auto">
        {isLoading ? (
          <div className="bg-base-100 w-full  p-2 pl-4">Loading...</div>
        ) : (
          data && data.map((user) => {
            return (
              <div
                key={user.id}
                className="bg-base-100 w-full  p-2 pl-4 hover:bg-base-200"
                onClick={() => handleClick(user.username)}
              >
                {user.username}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SearchBar;
