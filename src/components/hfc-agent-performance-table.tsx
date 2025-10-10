"use client"

import * as React from "react"
import {
  IconStar,
  IconTrendingUp,
  IconChevronDown,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { AgentMetrics } from "@/data/dataService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface HFCAgentPerformanceTableProps {
  data: AgentMetrics[]
}

const columns: ColumnDef<AgentMetrics>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => {
      const rank = row.index + 1
      return (
        <div className="flex items-center justify-center">
          <Badge
            variant={rank <= 3 ? "default" : "outline"}
            className={
              rank === 1
                ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                : rank === 2
                  ? "bg-slate-400 hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-600"
                  : rank === 3
                    ? "bg-amber-700 hover:bg-amber-800 dark:bg-amber-800 dark:hover:bg-amber-900"
                    : ""
            }
          >
            #{rank}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "agent_name",
    header: "Agent",
    cell: ({ row }) => {
      const agent = row.original
      const initials = agent.agent_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={agent.image_url} alt={agent.agent_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{agent.agent_name}</span>
            <span className="text-muted-foreground text-xs">
              {agent.department_name}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "avg_rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Avg Rating
          <IconChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rating = row.original.avg_rating
      return (
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tabular-nums">
            {rating.toFixed(2)}
          </span>
          <IconStar className="h-4 w-4 fill-amber-500 text-amber-500" />
        </div>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Total Reviews
          <IconChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <span className="font-medium tabular-nums">{row.original.total}</span>
      )
    },
  },
  {
    accessorKey: "percent_5_star",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          5-Star Rate
          <IconChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const percent = row.original.percent_5_star
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={percent >= 90 ? "default" : "outline"}
            className={
              percent >= 95
                ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                : percent >= 90
                  ? ""
                  : ""
            }
          >
            {percent.toFixed(1)}%
          </Badge>
          {percent >= 95 && (
            <IconTrendingUp className="h-4 w-4 text-green-500" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "star_distribution",
    header: "5-Star Distribution",
    cell: ({ row }) => {
      const { star_5, star_4, star_3, star_2, star_1, total } = row.original
      const percentages = {
        star_5: (star_5 / total) * 100,
        star_4: (star_4 / total) * 100,
        star_3: (star_3 / total) * 100,
        star_2: (star_2 / total) * 100,
        star_1: (star_1 / total) * 100,
      }

      return (
        <div className="flex items-center gap-1">
          <div className="flex h-2 w-32 overflow-hidden rounded-full bg-muted">
            {percentages.star_5 > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${percentages.star_5}%` }}
              />
            )}
            {percentages.star_4 > 0 && (
              <div
                className="bg-blue-500"
                style={{ width: `${percentages.star_4}%` }}
              />
            )}
            {percentages.star_3 > 0 && (
              <div
                className="bg-amber-500"
                style={{ width: `${percentages.star_3}%` }}
              />
            )}
            {percentages.star_2 > 0 && (
              <div
                className="bg-orange-500"
                style={{ width: `${percentages.star_2}%` }}
              />
            )}
            {percentages.star_1 > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${percentages.star_1}%` }}
              />
            )}
          </div>
          <span className="text-muted-foreground text-xs tabular-nums">
            {star_5}/{total}
          </span>
        </div>
      )
    },
  },
]

export function HFCAgentPerformanceTable({ data }: HFCAgentPerformanceTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "avg_rating", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Agent Performance</CardTitle>
        <CardDescription>
          Agents ranked by average rating and customer satisfaction
        </CardDescription>
        <div className="flex items-center gap-2 pt-4">
          <Input
            placeholder="Search agents..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {table.getRowModel().rows.length} of {data.length} agents
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
