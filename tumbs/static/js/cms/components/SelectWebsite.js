import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions as websitesActions } from "../slices/websites";
import Form from "react-bootstrap/Form";

const SelectWebsite = () => {
  const dispatch = useDispatch();
  const websites = useSelector((state) => state.websites.available);
  const currentWebsite = useSelector((state) => state.websites.current);

  const setCurrentWebsite = (e) => {
    dispatch(websitesActions.setCurrent(parseInt(e.target.value)));
  };

  if (currentWebsite) {
    return (
      <Form.Group>
        <Form.Label>Sites</Form.Label>
        <Form.Select
          name="website"
          value={currentWebsite.id}
          aria-label="Available websites"
          onChange={setCurrentWebsite}
        >
          {websites.map(({ id, name }) => (
            <option value={id} key={id}>
              {name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    );
  } else {
    return <h3 className="mt-3 mb-3">No sites yet</h3>;
  }
};

export default SelectWebsite;
