import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { Order, order} from "./orders"
import { display } from '@mui/system';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Input, TextField } from '@mui/material';




function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}


function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof order;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'user',
    numeric: false,
    disablePadding: true,
    label: 'User',
  },
  {
    id: 'shipper',
    numeric: false,
    disablePadding: false,
    label: 'Shipper',
  },
  {
    id: 'weight',
    numeric: true,
    disablePadding: false,
    label: 'Weight (Kg)',
  },
  {
    id: 'cost',
    numeric: true,
    disablePadding: false,
    label: 'Cost (₹)',
  },
  {
    id: 'source',
    numeric: false,
    disablePadding: false,
    label: 'Source',
  },
  {
    id: 'destination',
    numeric: false,
    disablePadding: false,
    label: 'Destination',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: 'Status',
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof order) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof order) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.id != 'user' ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  data:Array<order>,
  setData: React.Dispatch<React.SetStateAction<order[]>>
  refresh:boolean,
  performRefresh: React.Dispatch<React.SetStateAction<boolean>>
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const [filterShown, setFilterShown] = React.useState<boolean>(false)
  const [sourceFilter, setSourceFilter] = React.useState<string>("");
  const [destFilter, setDestFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string | "out-for-delivery" | "delivered">("");
  const filterClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    if(filterShown){

      props.setData(Order);
      setFilterShown(false)
      return;
    }
    setFilterShown(true);
  }
  const filter = (sourceFilter: string, destFilter: string, statusFilter: string) =>{
    let data = Order.filter((elem)=>elem.source.includes(sourceFilter))
    data = data.filter((elem)=>elem.destination.includes(destFilter))
    data = data.filter((elem)=>elem.status.includes(statusFilter))
    props.setData(data)
    props.performRefresh(!props.refresh)
  }
  const filterChanged = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, filterType: "dest" | "source" | "status") =>{
    const newFilter = e.target.value
    if(filterType == "dest"){
      setDestFilter(newFilter)
      filter(sourceFilter, newFilter, statusFilter)
      props.performRefresh(!props.refresh)
      return;
    }
    if(filterType == "source"){
      setSourceFilter(newFilter)
      filter(newFilter, destFilter, statusFilter)
      props.performRefresh(!props.refresh)
      return;
    }else{
      if (statusFilter==""){
        setStatusFilter("delivered")
        filter(sourceFilter, destFilter, "delivered")
      }else{
        setStatusFilter("")
        filter(sourceFilter, destFilter, "")
      }
    }
  }
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      
      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        ORDERS
      </Typography>
      <Box sx={{display:"flex", width:"50%", justifyContent:"space-evenly"}}>
        <Input value={sourceFilter} onChange={(e)=>filterChanged(e, "source")} placeholder={"Source Filter"} />
        <Input value={destFilter} onChange={(e)=>filterChanged(e, "dest")} placeholder={"Destination Filter"} />
        <FormControlLabel control={<Checkbox checked={statusFilter=="delivered"} onChange={(e)=> filterChanged(e,"status")}/>} label={"Delivered"}/>
      </Box>
      <Tooltip title="Filter list">
          <FilterListIcon />
      </Tooltip>
    </Toolbar>
  );
}

interface EditDialogProps {
  open: boolean,
  handleClose: (e: React.MouseEvent<HTMLButtonElement>, order?: order) => void,
  index: number,
}

function EditDialog(props: EditDialogProps){
  const [user, setUser] = React.useState<string>("")
  const [cost, setcost] = React.useState<number>()
  const [shipper, setShipper] = React.useState<string>("")
  const [weight, setWeight] = React.useState<number>()
  const [source, setSource] = React.useState<string>("")
  const [destination, setDestination] = React.useState<string>("")
  const [status, setStatus] = React.useState<"out-for-delivery" | "" | "delivered">("")

  const onChange = (e, setState: React.Dispatch<React.SetStateAction<any>>)=>{
    setState(e.target.value)
  }
  React.useEffect(()=>{
    if(props.index!=-1){
      const order = Order[props.index]
      setUser(order.user)
      setShipper(order.shipper)
      setcost(order.cost)
      setWeight(order.weight)
      setSource(order.source)
      setDestination(order.destination)
      setStatus(order.status)
    }
  },[props.open])
  return (
  <Dialog open={props.open}>
    <DialogTitle>Subscribe</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Edit the fields
      </DialogContentText>
      <TextField
        autoFocus
        margin="dense"
        id="name"
        label="User"
        value={user}
        fullWidth
        onChange={(e)=>onChange(e, setUser)}
        variant="standard"
      />
      <TextField
        autoFocus
        margin="dense"
        id="shipper"
        label="Shipper"
        value={shipper}
        fullWidth
        onChange={(e)=>onChange(e, setShipper)}
        variant="standard"
      />
      <TextField
        autoFocus
        margin="dense"
        id="cost"
        label="Cost"
        value={cost}
        fullWidth
        onChange={(e)=>onChange(e, setcost)}
        variant="standard"
      />
      <TextField
        autoFocus
        margin="dense"
        id="weight"
        label="Weight"
        value={weight}
        onChange={(e)=>onChange(e, setWeight)}
        fullWidth
        variant="standard"
      />
      <TextField
        autoFocus
        margin="dense"
        id="source"
        label="Source"
        value={source}
        fullWidth
        onChange={(e)=>onChange(e, setSource)}
        variant="standard"
      />
      <TextField
        autoFocus
        margin="dense"
        id="dest"
        label="Destination"
        value={destination}
        fullWidth
        onChange={(e)=>onChange(e, setDestination)}
        variant="standard"
      />
      <TextField
        autoFocus
        margin="dense"
        id="status"
        label="Status"
        value={status}
        fullWidth
        onChange={(e)=>onChange(e, setStatus)}
        variant="standard"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={props.handleClose} id={"cancel"}>Cancel</Button>
      <Button onClick={(e) => props.handleClose(e, {user: user, shipper: shipper, destination:destination, weight:weight, cost:cost, source:source, status:status})} id={"submit"}>Submit</Button>
    </DialogActions>
  </Dialog>
)
}

export default function EnhancedTable() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof order>('cost');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [data, setData] = React.useState<Array<order>>(Order);
  const [refresh, performRefresh] = React.useState<boolean>(false);
  const [editIndex, setEditIndex] = React.useState<number>(-1);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof order,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDialog = (index: number) => {
    setEditIndex(index);
    setDialogOpen(true);
  }


  const handleDialogClose = (e: React.MouseEvent<HTMLButtonElement>, order? : order) =>{
    if (e.currentTarget.id == "cancel"){
      setEditIndex(-1);
      setDialogOpen(false);
    }
    else{
      Order.splice(editIndex, 1, order);
      setData(Order);
      performRefresh(!refresh);
      setEditIndex(-1);
      setDialogOpen(false);
    }
  }
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - Order.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <EditDialog open={dialogOpen} handleClose={handleDialogClose} index={editIndex}/>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar data={data} setData={setData} refresh={refresh} performRefresh={performRefresh}/>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={Order.length}
            />
            <TableBody>
              {stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: order, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      onClick={()=>{openDialog(Order.indexOf(row))}}
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.user}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.user}
                      </TableCell>
                      <TableCell align="right">{row.shipper}</TableCell>
                      <TableCell align="right">{row.weight}</TableCell>
                      <TableCell align="right">{row.cost}</TableCell>
                      <TableCell align="right">{row.source}</TableCell>
                      <TableCell align="right">{row.destination}</TableCell>
                      <TableCell align="right">{row.status}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
    </Box>
  );
}