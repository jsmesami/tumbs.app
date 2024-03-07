import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions as stashActions } from "../slices/stash";
import { _ } from "../i18n";
import Form from "react-bootstrap/Form";

const SelectWebsite = ({ website }) => {
  const dispatch = useDispatch();
  const websites = useSelector((state) => state.stash.websites);

  const setCurrentWebsite = (e) => {
    dispatch(stashActions.setCurrentWebsite(parseInt(e.target.value)));
  };

  if (website) {
    return (
      <Form.Group>
        <Form.Label>Sites</Form.Label>
        <Form.Select
          name="website"
          value={website.id}
          aria-label={_("Available websites")}
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
    return <h3 className="mt-3 mb-3">{_("No sites yet")}</h3>;
  }
};

export default SelectWebsite;
