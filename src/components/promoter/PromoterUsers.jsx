import { useCallback, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Mail, Phone, ChevronRight, Loader, AlertCircle } from "lucide-react";
import { usePromoterUsers } from "@/hooks/usePromoterUsers";

const PromoterUsers = () => {
  const { currency } = useOutletContext();
  const {
    users,
    loading,
    isFetching,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
  } = usePromoterUsers();

  const handleSearchChange = useCallback((e) => {
    updateFilters({ search: e.target.value });
  }, [updateFilters]);

  const paginationNumbers = useMemo(() => {
    const pages = [];
    const maxPages = pagination.totalPages;
    const currentPage = pagination.page;

    if (maxPages <= 1) return [];

    pages.push(1);
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(maxPages - 1, currentPage + 1);

    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i += 1) {
      if (i !== 1 && i !== maxPages) pages.push(i);
    }
    if (endPage < maxPages - 1) pages.push("...");
    if (maxPages > 1) pages.push(maxPages);

    return pages;
  }, [pagination.page, pagination.totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">All registered attendee accounts with booking and spend insights.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-border/70">
          {pagination.total} Users
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pl-9"
        />
        {isFetching && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error loading users</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && !isFetching && users.length === 0 && (
        <Card className="bg-card/70 border-border/60">
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <p>No users found. Try adjusting your search.</p>
          </CardContent>
        </Card>
      )}

      {!loading && users.length > 0 && (
        <>
          <div className={`space-y-2 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}>
            {users.map((user) => (
              <Card key={user.id} className="bg-card/70 border-border/60">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{user.email}</span>
                          <span className="text-muted-foreground/60">|</span>
                          <Phone className="w-3 h-3" />
                          <span>{user.phone || "-"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 lg:justify-end">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center min-w-[74px]">
                          <p className="text-xs text-muted-foreground">Bookings</p>
                          <p className="font-semibold">{user.totalBookings}</p>
                        </div>
                        <div className="text-center min-w-[74px]">
                          <p className="text-xs text-muted-foreground">Tickets</p>
                          <p className="font-semibold">{user.totalTickets}</p>
                        </div>
                        <div className="text-center min-w-[100px]">
                          <p className="text-xs text-muted-foreground">Spent</p>
                          <p className="font-semibold text-accent">{currency(user.totalSpent)}</p>
                        </div>
                      </div>

                      <Link
                        to={`/promoter/users/${user.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition whitespace-nowrap"
                      >
                        View details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => changePage(pagination.page - 1)}
                      className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {paginationNumbers.map((pageNum, idx) => (
                    <PaginationItem key={`${pageNum}-${idx}`}>
                      {pageNum === "..." ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => changePage(pageNum)}
                          isActive={pageNum === pagination.page}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => changePage(pagination.page + 1)}
                      className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PromoterUsers;
