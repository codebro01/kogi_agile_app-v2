import React, { useState } from "react";
import { Button,Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

export const DeleteButton = ({ onConfirm, itemName = "this item", selectedRows }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>

     <Box  sx = {{position: "fixed", right: 50, bottom: 30, padding: "5px", background: "rgb(194, 186, 186)", zIndex: 999999}}>
        <IconButton onClick={handleOpen} color="error" width = {"100%"} disabled = {selectedRows.length < 1}>
          <DeleteIcon />
        </IconButton>
      </Box>


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{itemName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};