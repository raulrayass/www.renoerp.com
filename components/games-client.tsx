'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit2, Trash2, Gamepad2, Trophy, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { createGame, updateGame, deleteGame, getGames, addGameScore, deleteGameScore, getGameScores } from '@/app/actions/games'
import { getTeams } from '@/app/actions/teams'
import { Game, GameScore, Team } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
}

export function GamesClient({ userId }: Props) {
  const [gameList, setGameList] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [gameScores, setGameScores] = useState<GameScore[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', description: '', gameDate: '' })
  const [scoringForm, setScoringForm] = useState({ teamId: '', points: '' })
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  const emptyForm = { name: '', description: '', gameDate: '' }

  useState(() => {
    loadGames()
  })

  async function loadGames() {
    setLoading(true)
    try {
      const [gamesData, teamsData] = await Promise.all([
        getGames(userId),
        getTeams(userId),
      ])
      setGameList(gamesData)
      setTeams(teamsData)
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function loadScoresForGame(gameId: number) {
    try {
      const scores = await getGameScores(userId, gameId)
      setGameScores(scores)
    } catch (error) {
      toast.error('Error al cargar puntuaciones')
      console.error(error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre del juego es obligatorio')
      return
    }
    startTransition(async () => {
      try {
        if (editingId) {
          await updateGame(userId, editingId, form)
          toast.success('Juego actualizado')
        } else {
          await createGame(userId, form)
          toast.success('Juego creado')
        }
        setDialogOpen(false)
        setForm({ ...emptyForm })
        setEditingId(null)
        await loadGames()
      } catch (error) {
        toast.error('Error al guardar el juego')
        console.error(error)
      }
    })
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteGame(userId, id)
        toast.success('Juego eliminado')
        setDeleteDialogOpen(false)
        await loadGames()
      } catch (error) {
        toast.error('Error al eliminar el juego')
        console.error(error)
      }
    })
  }

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault()
    if (!scoringForm.teamId) {
      toast.error('Selecciona un equipo')
      return
    }
    if (!scoringForm.points || isNaN(Number(scoringForm.points))) {
      toast.error('Ingresa un número válido de puntos')
      return
    }
    if (!selectedGameId) return

    startTransition(async () => {
      try {
        await addGameScore(userId, selectedGameId, parseInt(scoringForm.teamId, 10), parseInt(scoringForm.points, 10))
        toast.success('Puntos registrados')
        setScoringForm({ teamId: '', points: '' })
        await loadScoresForGame(selectedGameId)
      } catch (error) {
        toast.error('Error al registrar puntos')
        console.error(error)
      }
    })
  }

  async function handleDeleteScore(scoreId: number, gameId: number) {
    startTransition(async () => {
      try {
        await deleteGameScore(userId, scoreId)
        toast.success('Puntos eliminados')
        await loadScoresForGame(gameId)
      } catch (error) {
        toast.error('Error al eliminar los puntos')
        console.error(error)
      }
    })
  }

  const openScoring = (gameId: number) => {
    setSelectedGameId(gameId)
    loadScoresForGame(gameId)
    setScoringDialogOpen(true)
  }

  const teamMap = new Map(teams.map((t) => [t.id, t]))

  const getTeamTotalPoints = (teamId: number): number => {
    return gameScores
      .filter((gs) => gs.teamId === teamId)
      .reduce((sum, gs) => sum + gs.points, 0)
  }

  const leaderboard = teams
    .map((team) => ({
      team,
      totalPoints: getTeamTotalPoints(team.id),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Juegos & Marcador</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Total: {gameList.length} juegos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo juego
        </Button>
      </div>

      {/* Leaderboard */}
      {teams.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Marcador General</h2>
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.team.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  style={{
                    borderLeft: `4px solid ${entry.team.color}`,
                  }}
                >
                  <div className="text-lg font-bold text-muted-foreground w-6 text-center">
                    {idx === 0 && '🥇'}
                    {idx === 1 && '🥈'}
                    {idx === 2 && '🥉'}
                    {idx > 2 && `${idx + 1}.`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.team.name}</p>
                  </div>
                  <div className="font-bold text-lg tabular-nums">
                    {entry.totalPoints}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gameList.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Gamepad2 className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay juegos registrados</p>
            <Button onClick={() => setDialogOpen(true)} className="mt-2 gap-2">
              <Plus className="w-4 h-4" />
              Crear primer juego
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {gameList.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{game.name}</h3>
                    {game.description && (
                      <p className="text-xs text-muted-foreground truncate">{game.description}</p>
                    )}
                    {game.gameDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(game.gameDate + 'T00:00:00').toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      onClick={() => openScoring(game.id)}
                      size="sm"
                      variant="default"
                      className="h-8 px-2 gap-1 text-xs"
                      title="Registrar puntos"
                    >
                      <Trophy className="w-3 h-3" />
                      Puntos
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingId(game.id)
                        setForm({
                          name: game.name,
                          description: game.description || '',
                          gameDate: game.gameDate || '',
                        })
                        setDialogOpen(true)
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      title="Editar juego"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      onClick={() => {
                        setDeletingId(game.id)
                        setDeleteDialogOpen(true)
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-red-100"
                      title="Eliminar juego"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

        {/* Game Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setForm({ ...emptyForm })
          setEditingId(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar juego' : 'Crear juego'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Carrera de obstáculos"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalles del juego..."
              />
            </div>
            <div>
              <Label htmlFor="gameDate">Fecha</Label>
              <Input
                id="gameDate"
                type="date"
                value={form.gameDate}
                onChange={(e) => setForm({ ...form, gameDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {editingId ? 'Guardar cambios' : 'Crear juego'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Scoring Dialog */}
      <Dialog open={scoringDialogOpen} onOpenChange={setScoringDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar puntos</DialogTitle>
            <DialogDescription>
              {selectedGameId && gameList.find((g) => g.id === selectedGameId)?.name}
            </DialogDescription>
          </DialogHeader>

          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Crea equipos primero para registrar puntos
            </p>
          ) : (
            <div className="space-y-4">
              {/* Current Scores */}
              <div>
                <Label className="font-semibold">Puntuación actual</Label>
                <div className="space-y-2 mt-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="text-sm font-medium">{team.name}</span>
                      </div>
                      <span className="font-bold">{getTeamTotalPoints(team.id)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Score Form */}
              <form onSubmit={handleAddScore} className="space-y-3 border-t pt-4">
                <div>
                  <Label htmlFor="teamId">Equipo</Label>
                  <select
                    id="teamId"
                    value={scoringForm.teamId}
                    onChange={(e) => setScoringForm({ ...scoringForm, teamId: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="">Selecciona un equipo</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="points">Puntos</Label>
                  <Input
                    id="points"
                    type="number"
                    value={scoringForm.points}
                    onChange={(e) => setScoringForm({ ...scoringForm, points: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                  Registrar puntos
                </Button>
              </form>

              {/* Score History */}
              {gameScores.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="font-semibold">Registro</Label>
                  <div className="space-y-1 mt-2 max-h-40 overflow-y-auto">
                    {gameScores.map((score) => (
                      <div key={score.id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2 min-w-0">
                          {teamMap.get(score.teamId) && (
                            <>
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: teamMap.get(score.teamId)!.color }}
                              />
                              <span className="truncate">{teamMap.get(score.teamId)!.name}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold">+{score.points}</span>
                          <Button
                            onClick={() => handleDeleteScore(score.id, score.gameId)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-red-100"
                          >
                            <Minus className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar juego?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán el juego y todos los puntos registrados para este juego.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isPending}
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}
